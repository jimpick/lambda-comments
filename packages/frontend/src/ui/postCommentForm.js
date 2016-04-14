import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import Textarea from 'react-textarea-autosize'
import styles from './postCommentForm.css'

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
    return (
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <Textarea
          {...commentContent}
          placeholder="Type Comment Here"
          // required for reset form to work (only on textarea's)
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
          placeholder="Email (optional)"
          {...authorEmail}
        />
        <input
          type="text"
          placeholder="Website (optional)"
          {...authorUrl}
        />
        <button type="submit">Submit</button>
      </form>
    )
  }
}
