import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'

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
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type comment here"
            {...commentText}
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
      </div>
    )
  }
}
