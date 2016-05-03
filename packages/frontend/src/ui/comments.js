/* eslint no-throw-literal: 0 */
import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { autobind } from 'core-decorators'
import Comment from './comment'
import PostCommentForm from './postCommentForm'
import { header, commentsContainer } from './comments.css'

export default class Comments extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    comments: PropTypes.array.isRequired,
    postComment: PropTypes.func.isRequired,
    resetCommentForm: PropTypes.func.isRequired,
  }

  @autobind
  async submit (data) {
    const {
      location: {
        pathname,
      },
      postComment,
      resetCommentForm,
    } = this.props
    try {
      const result = await postComment({
        url: `${window.document.location.origin}${pathname}`,
        pathname,
        ...data,
      })
      resetCommentForm({ pathname, clearContent: true })
      return result
    } catch (error) {
      if (
        error.name === 'ValidationError' ||
        error.name === 'SpamError' ||
        error.name === 'VerificationError'
      ) {
        throw error.data
      }
      throw { _error: 'An error occurred while posting the comment.' }
    }
  }

  render () {
    const {
      location: {
        pathname,
      },
      comments,
      resetCommentForm,
    } = this.props
    return (
      <div>
        <div className={header}>
          {comments.length} {comments.length !== 1 ? 'comments' : 'comment'} 
        </div>
        <div className={commentsContainer}>
          <ReactCSSTransitionGroup
            transitionName="comments"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}
          >
            {comments.map(comment => {
              const { id } = comment
              return (
                <Comment key={id} comment={comment} />
              )
            })}
          </ReactCSSTransitionGroup>
        </div>
        <PostCommentForm
          onSubmit={this.submit}
          pathname={pathname}
          resetCommentForm={resetCommentForm}
        />
      </div>
    )
  }

}
