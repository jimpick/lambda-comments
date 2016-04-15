import fetch from 'isomorphic-fetch'

export const GET_COMMENTS = 'GET_COMMENTS'
export const GET_COMMENTS_COMPLETE = 'GET_COMMENTS_COMPLETE'
export const GET_COMMENTS_ERROR = 'GET_COMMENTS_ERROR'

export const POST_COMMENT = 'POST_COMMENT'
export const POST_COMMENT_COMPLETE = 'POST_COMMENT_COMPLETE'
export const POST_COMMENT_ERROR = 'POST_COMMENT_ERROR'

const websiteUrl = __CONFIG__.websiteUrl
const apiUrl = __CONFIG__.apiUrl

export function getComments ({ url }) {
  return async dispatch => {
    const noTrailingSlashUrl = url.replace(/[\/*]$/, '')
    dispatch({ type: GET_COMMENTS, url: noTrailingSlashUrl })
    try {
      const fetchUrl = `${websiteUrl}${noTrailingSlashUrl}/posts.json`
      const response = await fetch(fetchUrl)
      const comments = await response.json()
      dispatch({ type: GET_COMMENTS_COMPLETE, comments })
    } catch (error) {
      dispatch({ type: GET_COMMENTS_ERROR, error })
    }
  }
}

export function postComment ({
  url,
  commentContent,
  authorName,
  authorEmail,
  authorUrl,
}) {
  return async dispatch => {
    const noTrailingSlashUrl = url.replace(/[\/*]$/, '')
    const payload = {
      url: noTrailingSlashUrl,
      commentContent,
      authorName,
      authorEmail,
      authorUrl,
    }
    dispatch({ type: POST_COMMENT, payload })
    try {
      const apiPostUrl = `${apiUrl}/comments`
      const response = await fetch(
        apiPostUrl,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )
      const responseStatus = await response.json()
      dispatch({ type: POST_COMMENT_COMPLETE, responseStatus })
    } catch (error) {
      dispatch({ type: POST_COMMENT_ERROR, error })
    }
  }
}
