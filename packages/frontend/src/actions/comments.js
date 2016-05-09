import fetch from 'isomorphic-fetch'
import { initialize as initializeReduxForm } from 'redux-form'
import jwa from 'jwa'
import store from 'store'

const hmac = jwa('HS256')

export const GET_COMMENTS = 'GET_COMMENTS'
export const GET_COMMENTS_COMPLETE = 'GET_COMMENTS_COMPLETE'
export const GET_COMMENTS_ERROR = 'GET_COMMENTS_ERROR'

export const POST_COMMENT = 'POST_COMMENT'
export const POST_COMMENT_COMPLETE = 'POST_COMMENT_COMPLETE'
export const POST_COMMENT_ERROR = 'POST_COMMENT_ERROR'

export const FORM_NAME = 'postCommment'
export const FORM_FIELDS = [
  'commentContent',
  'authorName',
  'authorEmail',
  'authorUrl',
]

const websiteUrl = __CONFIG__.websiteUrl
const apiUrl = __CONFIG__.apiUrl
const apiKey = __CONFIG__.apiKey

class ValidationError extends Error {
  constructor (data) {
    super()
    this.name = 'ValidationError'
    this.data = data
    this.stack = (new Error()).stack
  }
}

class SpamError extends Error {
  constructor (data) {
    super()
    this.name = 'SpamError'
    this.data = data
    this.stack = (new Error()).stack
  }
}

class VerificationError extends Error {
  constructor (data) {
    super()
    this.name = 'VerificationError'
    this.data = data
    this.stack = (new Error()).stack
  }
}

export function getComments ({ url, updateOnly = false }) {
  return async dispatch => {
    const noTrailingSlashUrl = url.replace(/[\/*]$/, '')
    dispatch({ type: GET_COMMENTS, url: noTrailingSlashUrl, updateOnly })
    try {
      const fetchUrl =
        `${websiteUrl}/comments${noTrailingSlashUrl}/comments.json`
      const response = await fetch(fetchUrl)
      const { status } = response
      if (status === 403 || status === 404) {
        dispatch({ type: GET_COMMENTS_COMPLETE, comments: [], updateOnly })
        return
      }
      const comments = await response.json()
      dispatch({ type: GET_COMMENTS_COMPLETE, comments, updateOnly })
    } catch (error) {
      dispatch({ type: GET_COMMENTS_ERROR, error, updateOnly })
    }
  }
}

function refetchCommentsWhilePending ({ url }) {
  return (dispatch, getState) => {
    let retryCounter = 0
    const interval = setInterval(async () => {
      const { comments: { pendingComments } } = getState()
      if (retryCounter++ > 10 || Object.keys(pendingComments).length === 0) {
        clearInterval(interval)
      } else {
        dispatch(getComments({ url, updateOnly: true }))
      }
    }, 5000)
  }
}

export function postComment ({
  url,
  pathname,
  commentContent,
  authorName,
  authorEmail,
  authorUrl,
}) {
  return async dispatch => {
    const payload = {
      permalink: url,
      referrer: window.document.referrer,
      userAgent: window.navigator.userAgent,
      commentContent,
      authorName,
      authorEmail,
      authorUrl,
    }
    dispatch({ type: POST_COMMENT, payload })
    const signature = hmac.sign(JSON.stringify(payload), apiKey)
    const body = JSON.stringify({
      signature,
      payload,
    })
    try {
      const apiPostUrl = `${apiUrl}/comments`
      const response = await fetch(
        apiPostUrl,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body,
        }
      )
      const { status } = response
      const responseData = await response.json()
      if (status === 201) {
        dispatch({ type: POST_COMMENT_COMPLETE, responseData, payload })
        dispatch(refetchCommentsWhilePending({ url: pathname }))
      } else if (status === 400) {
        const { errorMessage } = responseData
        if (!errorMessage) {
          throw new Error('Error occured while posting comment')
        }
        const parsedError = JSON.parse(errorMessage)
        const { error, data } = parsedError
        if (error === 'ValidationError') {
          throw new ValidationError(data)
        }
        if (error === 'SpamError') {
          throw new SpamError(data)
        }
        if (error === 'VerificationError') {
          throw new VerificationError(data)
        }
        throw new Error('Error occured while posting comment')
      } else {
        throw new Error('Unexpected status on response')
      }
    } catch (error) {
      dispatch({ type: POST_COMMENT_ERROR, error })
      throw error
    }
  }
}

export function resetCommentForm ({ pathname, clearContent }) {
  return dispatch => {
    const data = {
      authorName: '',
      authorEmail: '',
      authorUrl: '',
      commentContent: '',
    }
    if (store.enabled) {
      const savedPathname = store.get('pathname')
      data.authorName = store.get('authorName')
      data.authorEmail = store.get('authorEmail')
      data.authorUrl = store.get('authorUrl')
      if (!clearContent && pathname === savedPathname) {
        data.commentContent = store.get('commentContent')
      }
    }
    dispatch(initializeReduxForm(FORM_NAME, data, FORM_FIELDS))
  }
}
