import React, { Component, PropTypes } from 'react'
import { autobind } from 'core-decorators'
import PostCommentForm from './postCommentForm'
import { header } from './comments.css'

export default class Comments extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    comments: PropTypes.array.isRequired,
    postComment: PropTypes.func.isRequired,
  }

  @autobind
  submit (data) {
    const {
      location: {
        pathname,
      },
      postComment,
    } = this.props
    postComment({
      url: `${window.document.location.origin}${pathname}`,
      ...data,
    })
  }

  render () {
    const { params, location, comments } = this.props
    return (
      <div>
        <h2 className={header}>{comments.length} comments</h2>
        <pre>Comments: {JSON.stringify(comments, null, 2)}</pre>
        <PostCommentForm onSubmit={this.submit} />
      </div>
    )
  }

}
