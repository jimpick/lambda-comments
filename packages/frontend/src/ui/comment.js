import React, { Component, PropTypes } from 'react'

export default class Comment extends Component {

  static propTypes = {
    comment: PropTypes.object.isRequired,
  }

  render () {
    const { comment } = this.props
    return (
      <div>
        <pre>{JSON.stringify(comment, null, 2)}</pre>
      </div>
    )
  }

}
