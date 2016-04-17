/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "unused" }] */
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
  const { comments, error } = action
  switch (action.type) {
    case GET_COMMENTS:
      return {
        ...state,
        loading: true,
      }
    case GET_COMMENTS_COMPLETE:
      return {
        ...state,
        loading: false,
        comments,
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
          responseStatus: {
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
