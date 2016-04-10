import React, { Component, PropTypes } from 'react'
import favicon from './favicon.ico'

const shims = `
  (String.prototype.trim && Function.prototype.bind) ||
  document.write('<script src="/es5-shim.js"><\\/script>');
  window.Promise || document.write('<script src="/Promise.js"><\\/script>');
  window.fetch || document.write('<script src="/fetch.js"><\\/script>');
`

export default class Document extends Component {

  static propTypes = {
    styles: PropTypes.arrayOf(PropTypes.node),
    scripts: PropTypes.arrayOf(PropTypes.node),
    content: PropTypes.string,
    title: PropTypes.string,
    initialState: PropTypes.object,
  }

  render () {
    const { styles, scripts, content, title } = this.props

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href={favicon} />
          <title>{title}</title>
          {styles}
        </head>
        <body>
          <div
            id="lambda-comments"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <script dangerouslySetInnerHTML={{ __html: shims }} />
          {scripts}
        </body>
      </html>
    )
  }

}
