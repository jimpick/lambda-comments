import fetch from 'isomorphic-fetch'

export const GET_COMMENTS = 'GET_COMMENTS'
export const GET_COMMENTS_COMPLETE = 'GET_COMMENTS_COMPLETE'
export const GET_COMMENTS_ERROR = 'GET_COMMENTS_ERROR'

const commentsBaseUrl =
  'https://s3-us-west-2.amazonaws.com/lambdacomments-websites3-1pyr3oyww687y'

export function getComments ({ url }) {
  return async dispatch => {
    const noTrailingSlashUrl = url.replace(/[\/*]$/, '')
    dispatch({ type: GET_COMMENTS, url: noTrailingSlashUrl })
    try {
      const fetchUrl = `${commentsBaseUrl}${noTrailingSlashUrl}/posts.json`
      const response = await fetch(fetchUrl)
      const comments = await response.json()
      dispatch({ type: GET_COMMENTS_COMPLETE, comments })
    } catch (error) {
      dispatch({ type: GET_COMMENTS_ERROR, error })
    }
  }
}
