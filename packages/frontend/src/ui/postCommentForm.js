import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import Textarea from 'react-textarea-autosize'
import { Motion, spring, presets } from 'react-motion'
import Measure from 'react-measure'
import Spinner from 'react-spinner'
import '!style!css!react-spinner/react-spinner.css'
import { autobind } from 'core-decorators'
import { isEmail, isURL } from 'validator'
import gitHubSvg from 'octicons/svg/mark-github.svg'
import Comment from './comment'
import {
  postCommentForm,
  hasError,
  errorMessage,
  postCommentFormHeader,
  markdownNote,
  previewWrapper,
  preview,
  spinnerButton,
  buttonContent,
  buttonText,
  spinnerWrapper,
  footer,
  marketing,
} from './comments.css'
import { FORM_NAME, FORM_FIELDS } from '../actions/comments'

function validate (values) {
  const errors = {}
  const { commentContent, authorEmail, authorUrl } = values
  if (!commentContent) {
    errors.commentContent = 'Required'
  }
  if (commentContent && commentContent.length < 3) {
    errors.commentContent = 'Must be at least 3 characters'
  }
  if (authorEmail && !isEmail(authorEmail)) {
    errors.authorEmail = 'Email format not valid'
  }
  if (authorUrl && !isURL(authorUrl)) {
    errors.authorUrl = 'URL format not valid'
  }
  return errors
}

@reduxForm({
  form: FORM_NAME,
  fields: FORM_FIELDS,
  validate,
})
export default class PostCommentForm extends Component {

  static propTypes = {
    pathname: PropTypes.string.isRequired,
    fields: PropTypes.object.isRequired,
    error: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    resetCommentForm: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = { height: 0 }
  }

  componentWillMount () {
    const { resetCommentForm, pathname } = this.props
    resetCommentForm({ pathname })
  }

  componentWillReceiveProps (nextProps) {
    const {
      fields: {
        commentContent: {
          value: commentContent,
        },
        authorName: {
          value: authorName,
        },
        authorEmail: {
          value: authorEmail,
        },
        authorUrl: {
          value: authorUrl,
        },
      },
      pathname,
    } = nextProps
    localStorage.setItem('pathname', pathname)
    localStorage.setItem('commentContent', commentContent)
    localStorage.setItem('authorName', authorName)
    localStorage.setItem('authorEmail', authorEmail)
    localStorage.setItem('authorUrl', authorUrl)
  }

  @autobind
  getStyle () {
    const { fields: { commentContent } } = this.props
    const { height } = this.state
    if (!commentContent.value || !height) {
      return { height: spring(5, presets.gentle) }
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
      error,
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
            <a
              target="_blank"
              rel="noopener"
              href={gitHubUrl}
            >
              GitHub-style markdown is supported
            </a>
          </span>
        </div>
        {error &&
          <div className={errorMessage}>
            {error}
          </div>
        }
        <Textarea
          placeholder="Type Comment Here"
          className={
            commentContent.touched && commentContent.error && hasError
          }
          value={commentContent.value || ''}
          {...commentContent}
        />
        {commentContent.touched && commentContent.error &&
          <div className={errorMessage}>
            {commentContent.error}
          </div>
        }
        <input
          type="text"
          placeholder="Name (optional)"
          className={
            authorName.touched && authorName.error && hasError
          }
          spellCheck="false"
          {...authorName}
        />
        {authorName.touched && authorName.error &&
          <div className={errorMessage}>
            {authorName.error}
          </div>
        }
        <input
          type="email"
          placeholder="Email (optional, not shown)"
          className={
            authorEmail.touched && authorEmail.error && hasError
          }
          spellCheck="false"
          {...authorEmail}
        />
        {authorEmail.touched && authorEmail.error &&
          <div className={errorMessage}>
            {authorEmail.error}
          </div>
        }
        <input
          type="text"
          placeholder="Website (optional)"
          className={
            authorUrl.touched && authorUrl.error && hasError
          }
          spellCheck="false"
          {...authorUrl}
        />
        {authorUrl.touched && authorUrl.error &&
          <div className={errorMessage}>
            {authorUrl.error}
          </div>
        }
        <Motion
          style={this.getStyle()}
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
        <div className={footer}>
          <button
            type="submit"
            className={spinnerButton}
            disabled={submitting}
          >
            <div className={buttonContent}>
              <div className={buttonText}>
                {submitting ? 'Submitting Comment' : 'Submit Comment'}
              </div>
              {submitting &&
                <div className={spinnerWrapper}>
                  <Spinner />
                </div>
              }
            </div>
          </button>
          <div className={marketing}>
            Powered by {' '}
            <a
              target="_blank"
              rel="noopener"
              href="https://github.com/jimpick/lambda-comments"
            >
              lambda-comments
              <img src={gitHubSvg} />
            </a>
          </div>
        </div>
      </form>
    )
  }
}
