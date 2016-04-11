import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { getComments } from '../actions/comments'
import Comments from './comments'

@connect(
  () => ({ jim: 1 }),
  { getComments }
)
export default class CommentsContainer extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    getComments: PropTypes.func.isRequired,
  }

  render () {
    const { params, location } = this.props
    return (
      <Comments params={params} location={location} />
    )
  }

}
