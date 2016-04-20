import { parse as urlParse } from 'url'
import { normalize as pathNormalize, join as pathJoin } from 'path'
import slugid from 'slugid'
import moment from 'moment'
import { isEmail, isURL } from 'validator'
import { generateReference } from '../../lib/references'
import { upload } from '../../lib/s3'
import { updateRecord } from '../../lib/dynamoDb'

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

function validate (event) {
  const {
    url,
    commentContent,
    authorName,
    authorEmail,
    authorUrl,
    dryRun,
    quiet
  } = event
  const errors = {}
  if (!url) {
    errors._error = 'Missing url'
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

export async function handler (event, context, callback) {
  if (!callback) {
    const errorMessage = 'Requires Node 4.3 or greater on Lambda'
    console.log(errorMessage)
    context.error(context.fail(errorMessage))
    return
  }
  try {
    const {
      url,
      commentContent,
      authorName,
      authorEmail,
      authorUrl,
      dryRun,
      quiet
    } = event
    validate(event)
    const { pathname } = urlParse(url)
    const normalizedPath = pathNormalize(pathname).replace(/\/+$/, '')
    const dirName = pathJoin('comments', normalizedPath)
    if (!commentContent) {
      throw new Error('Missing commentContent')
    }
    const now = moment.utc()
    const actionRef = generateReference(now)
    const id = slugid.v4()
    const action = {
      type: 'NEW_COMMENT',
      actionRef,
      payload: {
        id,
        url,
        commentContent,
        authorName,
        authorEmail,
        authorUrl
      },
      submittedDate: now.toISOString()
    }
    if (!quiet) {
      console.log('actionRef:', actionRef)
      console.log('url:', url)
    }
    if (!dryRun) {
      await uploadJson({ dirName, actionRef, action })
      await updateRecord({ dirName, actionRef })
    }
    callback( null, { id } )
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log('ValidationError', error.data)
      callback(JSON.stringify({
        error: 'ValidationError',
        data: error.data
      }))
      return
    }
    console.log('Queue Comment error', error)
    console.log(error.stack)
    callback(JSON.stringify({
      error: 'Expection occurred'
    }))
  }
}
