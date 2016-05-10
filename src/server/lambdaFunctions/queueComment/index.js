import { parse as urlParse } from 'url'
import { normalize as pathNormalize, join as pathJoin } from 'path'
import slugid from 'slugid'
import moment from 'moment'
import { isEmail, isURL } from 'validator'
import jwa from 'jwa'
import dotenv from 'dotenv'
import { generateReference } from '../../lib/references'
import { uploadPrivate } from '../../lib/s3'
import Akismet from '../../lib/akismet'
import { updateRecord } from '../../lib/dynamoDb'
import { apiKey } from '../../../../deploy/state/apiKey.json'

dotenv.config({ silent: true })

const hmac = jwa('HS256')

let akismet = null

class ValidationError extends Error {
  constructor (data) {
    super()
    this.name = 'ValidationError'
    this.data = data
    this.stack = (new Error()).stack
  }
}

function uploadJson ({ dirName, actionRef, action }) {
  return uploadPrivate({
    key: `${dirName}/.actions/${actionRef}/action.json`,
    data: JSON.stringify(action),
    contentType: 'application/json'
  })
}

function validate (payload) {
  const {
    permalink,
    userAgent,
    commentContent,
    authorName,
    authorEmail,
    authorUrl
  } = payload
  const errors = {}
  if (!permalink) {
    errors._error = 'Missing permalink'
  }
  if (!userAgent) {
    errors._error = 'Missing user agent'
  }
  if (!commentContent) {
    errors.commentContent = 'Required'
  }
  if (commentContent && commentContent.length < 3) {
    errors.commentContent = 'Must be at least 3 characters'
  }
  if (authorEmail && !isEmail(authorEmail)) {
    errors.authorEmail = 'Email format not valid'
  }
  if (authorUrl && !isURL(authorUrl)) {
    errors.authorUrl = 'URL format not valid'
  }
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors)
  }
}

async function checkSpam ({ payload, quiet, isTest }) {
  if (!akismet) {
    akismet = new Akismet()
    if (akismet.configured()) {
      const verified = await akismet.verifyKey()
      if (verified) {
        if (!quiet) {
          console.log('Akismet key/blog verified')
        }
      } else {
        throw new Error('Akismet key/blog failed verification')
      }
    }
  }
  if (akismet.configured()) {
    const {
      permalink,
      referrer,
      userAgent,
      commentContent,
      authorName,
      authorEmail,
      authorUrl,
      sourceIp
    } = payload
    const options = {
      user_ip: sourceIp,
      user_agent: userAgent,
      referrer,
      comment_type: 'comment',
      comment_author: authorName,
      comment_author_email: authorEmail,
      comment_author_url: authorUrl,
      comment_content: commentContent,
      is_test: isTest
    }
    const spam = await akismet.checkSpam(options)
    if (!quiet) {
      console.log(spam ? 'Akismet detected spam' : 'Akismet check passed')
    }
    if (spam) {
      throw new Error('Spam')
    }
  }
}

export async function handler (event, context, callback) {
  if (!callback) {
    const errorMessage = 'Requires Node 4.3 or greater on Lambda'
    console.log(errorMessage)
    context.error(context.fail(errorMessage))
    return
  }
  const quiet = event ? !!event.quiet : false
  try {
    const {
      sourceIp,
      fields,
      dryRun,
      quiet,
      skipSpamCheck,
      isTest
    } = event
    const {
      signature,
      payload: incomingPayload
    } = fields
    const buffer = new Buffer(JSON.stringify(incomingPayload))
    const verification = hmac.verify(
      buffer,
      signature,
      apiKey
    )
    if (!verification) {
      throw new Error('VerificationError')
    }
    validate(incomingPayload)
    const {
      permalink,
      referrer,
      userAgent,
      commentContent,
      authorName,
      authorEmail,
      authorUrl
    } = incomingPayload
    const { pathname } = urlParse(permalink)
    const normalizedPath = pathNormalize(pathname).replace(/\/+$/, '')
    const dirName = pathJoin('comments', normalizedPath)
    if (!commentContent) {
      throw new Error('Missing commentContent')
    }
    const now = moment.utc()
    const actionRef = generateReference(now)
    const id = slugid.v4()
    const payload = {
      id,
      permalink,
      referrer,
      userAgent,
      commentContent,
      authorName,
      authorEmail,
      authorUrl,
      sourceIp
    }
    const action = {
      type: 'NEW_COMMENT',
      actionRef,
      payload,
      submittedDate: now.toISOString()
    }
    if (!quiet) {
      console.log('actionRef:', actionRef)
      console.log('permalink:', permalink)
    }
    if (!dryRun) {
      await uploadJson({ dirName, actionRef, action })
      if (!skipSpamCheck) {
        await checkSpam({ payload, quiet, isTest })
      }
      await updateRecord({ dirName, actionRef })
    }
    callback( null, { id } )
  } catch (error) {
    if (error.name === 'ValidationError') {
      if (!quiet) {
        console.log('ValidationError', error.data)
      }
      callback(JSON.stringify({
        error: 'ValidationError',
        data: error.data
      }))
      return
    }
    if (error.message === 'Spam') {
      if (!quiet) {
        console.log('Spam detected')
      }
      callback(JSON.stringify({
        error: 'SpamError',
        data: {
          _error: 'Our automated filter thinks this comment is spam.'
        }
      }))
      return
    }
    if (error.message === 'VerificationError') {
      if (!quiet) {
        console.log('Checksum verification failed')
      }
      callback(JSON.stringify({
        error: 'VerificationError',
        data: {
          _error: 'Checksum verification failed.'
        }
      }))
      return
    }
    if (!quiet) {
      console.log('Queue Comment error', error)
      console.log(error.stack)
    }
    callback(JSON.stringify({
      error: 'Exception occurred'
    }))
  }
}
