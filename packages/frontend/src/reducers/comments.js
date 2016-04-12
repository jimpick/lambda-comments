import {
  GET_COMMENTS,
  GET_COMMENTS_COMPLETE,
  GET_COMMENTS_ERROR,
} from '../actions/comments'

const initialState = {
  loading: false,
  comments: null,
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
    default:
      return state
  }
}
