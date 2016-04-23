/* eslint prefer-template: 0 */
import React, { Component, PropTypes } from 'react'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import moment from 'moment'
import {
  commentContainer,
  commentHeader,
  authorNameStyle,
  authorLinkStyle,
  spacer,
  timeFrom,
  commentContentStyle,
} from './comments.css'

const md = new MarkdownIt({
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>'
        )
      } catch (__) {
        // Don't fail
      }
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  },
})

export default class Comment extends Component {

  static propTypes = {
    comment: PropTypes.object.isRequired,
  }

  render () {
    const { comment } = this.props
    const { id, authorName, authorUrl, date, commentContent, pending } = comment
    const html = md.render(commentContent || 'No content.')
    let authorElement = authorName || 'Anonymous'
    if (authorUrl) {
      authorElement = <a href={authorUrl}>{authorElement}</a>
    }
    let authorLink = null
    if (authorUrl) {
      authorLink = <a href={authorUrl}>{authorUrl}</a>
    }
    return (
      <div className={commentContainer} id={`comment-${id}`}>
        <div className={commentHeader}>
          <span className={authorNameStyle}>
            {authorElement}
          </span>
          <span className={spacer}> • </span>
          {authorLink &&
            <span className={authorLinkStyle}>
              {authorLink}
            </span>
          }
          {authorLink && <span className={spacer}> • </span>}
          <span className={timeFrom}>
            {moment(date).fromNow()}
            {pending && ' (Submitted)'}
          </span>
        </div>
        <div
          className={commentContentStyle}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }

}
