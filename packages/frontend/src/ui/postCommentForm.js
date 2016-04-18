import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import Textarea from 'react-textarea-autosize'
import { Motion, spring, presets } from 'react-motion'
import Measure from 'react-measure'
import { autobind } from 'core-decorators'
import Comment from './comment'
import {
  postCommentForm,
  postCommentFormHeader,
  markdownNote,
  previewWrapper,
  preview,
  btn,
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
    submitting: PropTypes.bool.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = { height: 0 }
  }

  @autobind
  getStyles () {
    const { fields: { commentContent } } = this.props
    const { height } = this.state
    if (!commentContent.value || !height) {
      return { height: spring(0, presets.gentle) }
    }
    return { height: spring(height + 20, presets.gentle) }
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
      submitting,
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
        <Motion
          style={this.getStyles()}
        >
          {interpolatingStyle =>
            <div className={previewWrapper} style={interpolatingStyle}>
              <Measure
                whitelist={['height']}
                config={{ subtree: true, childList: true, attributes: true }}
                onMeasure={({ height }) => this.setState({ height })}
              >
                <div>
                  <div className={postCommentFormHeader}>
                    <strong>Preview your comment</strong>
                  </div>
                  <div className={preview}>
                    <Comment comment={previewComment} />
                  </div>
                </div>
              </Measure>
            </div>
          }
        </Motion>
        <button
          type="submit"
          className={btn}
          disabled={submitting}
        >
          {submitting ? 'Submitting' : 'Submit'}
        </button>
      </form>
    )
  }
}
