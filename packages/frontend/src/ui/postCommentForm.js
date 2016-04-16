import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import Textarea from 'react-textarea-autosize'
import Comment from './comment'
import {
  postCommentForm,
  postCommentFormHeader,
  markdownNote,
  preview,
} from './comments.css'

@reduxForm({
  form: 'postCommment',
  fields: [
    'commentContent',
    'authorName',
    'authorEmail',
    'authorUrl',
  ],
})
export default class PostCommentForm extends Component {

  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  }

  render () {
    const {
      fields: {
        commentContent,
        authorName,
        authorEmail,
        authorUrl,
      },
      handleSubmit,
    } = this.props
    const gitHubUrl =
      'https://help.github.com/articles/basic-writing-and-formatting-syntax/'
    const previewComment = {
      authorName: authorName.value,
      authorUrl: authorUrl.value,
      date: new Date(),
      commentContent: commentContent.value,
    }
    return (
      <form
        className={postCommentForm}
        onSubmit={handleSubmit}
      >
        <div className={postCommentFormHeader}>
          <strong>Add your comment</strong>
          <span className={markdownNote}>
            <a href={gitHubUrl} target="_blank">
              GitHub-style markdown is supported
             </a>
          </span>
        </div>
        <Textarea
          {...commentContent}
          placeholder="Type Comment Here"
          // required for reset form to work (only on textarea)
          // see: https://github.com/facebook/react/issues/2533
          value={commentContent.value || ''}
        />
        <input
          type="text"
          placeholder="Name (optional)"
          {...authorName}
        />
        <input
          type="text"
          placeholder="Email (optional, not shown)"
          {...authorEmail}
        />
        <input
          type="text"
          placeholder="Website (optional)"
          {...authorUrl}
        />
        <div className={postCommentFormHeader}>
          <strong>Preview your comment</strong>
        </div>
        <div className={preview}>
          <Comment comment={previewComment} />
        </div>
        <button type="submit">Submit</button>
      </form>
    )
  }
}
