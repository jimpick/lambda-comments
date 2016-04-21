import { parse as urlParse } from 'url'
import { normalize as pathNormalize, join as pathJoin } from 'path'
import slugid from 'slugid'
import moment from 'moment'
import { isEmail, isURL } from 'validator'
import { generateReference } from '../../lib/references'
import { upload } from '../../lib/s3'
import Akismet from '../../lib/akismet'
import { updateRecord } from '../../lib/dynamoDb'

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
  return upload({
    key: `${dirName}/.actions/${actionRef}/action.json`,
    data: JSON.stringify(action),
    contentType: 'application/json'
  })
}

function validate (fields) {
  const {
    permalink,
    userAgent,
    commentContent,
    authorName,
    authorEmail,
    authorUrl
  } = fields
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

async function checkSpam ({ payload, quiet }) {
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
    // Check for spam here
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
      quiet
    } = event
    const {
      permalink,
      referrer,
      userAgent,
      commentContent,
      authorName,
      authorEmail,
      authorUrl
    } = fields
    validate(fields)
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
      await checkSpam({ payload, quiet })
      await uploadJson({ dirName, actionRef, action })
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
    if (!quiet) {
      console.log('Queue Comment error', error)
      console.log(error.stack)
    }
    callback(JSON.stringify({
      error: 'Exception occurred'
    }))
  }
}
