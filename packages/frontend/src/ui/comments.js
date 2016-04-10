import React, { Component, PropTypes } from 'react'
import { autobind } from 'core-decorators'
import PostCommentForm from './postCommentForm'
import { header } from './comments.css'

export default class Comments extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  }

  @autobind
  submit (data) {
    console.log('Jim submit', data)
  }

  render () {
    const { params, location } = this.props
    return (
      <div>
        <h2 className={header}>RAR!</h2>
        <PostCommentForm onSubmit={this.submit} />
        <pre>Params: {JSON.stringify(params, null, 2)}</pre>
        <pre>Location: {JSON.stringify(location, null, 2)}</pre>
      </div>
    )
  }

}
