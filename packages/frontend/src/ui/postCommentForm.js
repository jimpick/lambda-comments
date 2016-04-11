import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import Textarea from 'react-textarea-autosize'
import styles from './postCommentForm.css'

@reduxForm({
  form: 'postCommment',
  fields: [
    'commentText',
    'author',
    'email',
    'website',
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
        commentText,
        author,
        email,
        website,
      },
      handleSubmit,
    } = this.props
    return (
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <Textarea
          {...commentText}
          placeholder="Type Comment Here"
          // required for reset form to work (only on textarea's)
          // see: https://github.com/facebook/react/issues/2533
          value={commentText.value || ''}
        />
        <input
          type="text"
          placeholder="Name (optional)"
          {...author}
        />
        <input
          type="text"
          placeholder="Email (optional)"
          {...email}
        />
        <input
          type="text"
          placeholder="Website (optional)"
          {...website}
        />
        <button type="submit">Submit</button>
      </form>
    )
  }
}
