import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import * as commentsActions from '../actions/comments'
import Comments from './comments'

const getComments = state => state.comments.comments
const getPendingComments = state => state.comments.pendingComments
const getMergedComments = createSelector(
  [ getComments, getPendingComments ],
  (comments, pendingComments) => {
    const commentIds = comments.reduce(
      (prev, comment) => ({
        ...prev,
        [comment.id]: true,
      }),
      {}
    )
    const mergedComments = [ ...comments ]
    Object.keys(pendingComments).forEach(id => {
      if (!commentIds[id]) {
        mergedComments.push({
          id,
          ...pendingComments[id],
          pending: true
        })
      }
    })
    const sortedComments = sortBy(mergedComments, 'date')
    return mergedComments
  }
)

@connect(
  state => {
    const { loading, error } = state.comments
    const comments = getMergedComments(state)
    return {
      loading,
      error,
      comments,
    }
  },
  {
    getComments: commentsActions.getComments,
    postComment: commentsActions.postComment,
  }
)
export default class CommentsContainer extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    getComments: PropTypes.func.isRequired,
    postComment: PropTypes.func.isRequired,
    comments: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string
  }

  componentDidMount () {
    const { getComments, location: { pathname } } = this.props
    getComments({ url: pathname })
  }

  render () {
    const {
      params,
      location,
      comments,
      loading,
      error,
      postComment,
    } = this.props
    if (loading) {
      return (
        <div>
          Loading comments...
        </div>
      )
    }
    if (error) {
      return (
        <div>
          Error loading comments.
        </div>
      )
    }
    if (!comments) {
      return null
    }
    return (
      <Comments
        params={params}
        location={location}
        comments={comments}
        postComment={postComment}
      />
    )
  }

}
