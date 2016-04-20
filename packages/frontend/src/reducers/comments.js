/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "unused" }] */
import { keyBy } from 'lodash'
import {
  GET_COMMENTS,
  GET_COMMENTS_COMPLETE,
  GET_COMMENTS_ERROR,
  POST_COMMENT_COMPLETE,
} from '../actions/comments'

const initialState = {
  loading: false,
  comments: [],
  pendingComments: {},
  error: null,
}

export default function commentsReducer (state = initialState, action) {
  const { comments, error, updateOnly } = action
  switch (action.type) {
    case GET_COMMENTS:
      return {
        ...state,
        loading: !updateOnly,
      }
    case GET_COMMENTS_COMPLETE:
      {
        if (!updateOnly) {
          return {
            ...state,
            loading: false,
            comments,
          }
        }
        // updateOnly
        const commentIds = keyBy(comments, 'id')
        const {
          comments: oldComments,
          pendingComments: oldPendingComments,
        } = state
        const oldCommentIds = keyBy(oldComments, 'id')
        const newComments = [...oldComments]
        const newPendingComments = { ...oldPendingComments }
        let modified = false
        Object.keys(newPendingComments).forEach(id => {
          if (!oldCommentIds[id] && commentIds[id]) {
            const newComment = commentIds[id]
            newComments.push(newComment)
            delete newPendingComments[id]
            modified = true
          }
        })
        if (modified) {
          return {
            ...state,
            comments: newComments,
            pendingComments: newPendingComments,
          }
        }
        return state
      }
    case GET_COMMENTS_ERROR:
      return {
        ...state,
        loading: false,
        error: error.message,
      }
    case POST_COMMENT_COMPLETE:
      {
        const { pendingComments } = state
        const {
          responseData: {
            id,
          },
          payload: {
            url: unused,
            ...fields,
          },
        } = action
        return {
          ...state,
          pendingComments: {
            ...pendingComments,
            [id]: fields,
          },
        }
      }
    default:
      return state
  }
}
