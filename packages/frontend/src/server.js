/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react'
import { createServer } from 'react-project/server'
import { Route, RouterContext } from 'react-router'

class Document extends Component {

  static propTypes = {
    content: PropTypes.string,
  }

  render () {
    const { content } = this.props

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Server</title>
        </head>
        <body dangerouslySetInnerHTML={{ __html: content }} />
      </html>
    )
  }

}

class App extends Component {
  render () {
    return (
      <div>
        No server app here.
      </div>
    )
  }
}

const routes = (
  <Route path="*" component={App} />
)

function getApp (req, res, requestCallback) {
  // here is your chance to do things like get an auth token and generate
  // your route config w/ request aware `onEnter` hooks, etc.
  requestCallback(null, {
    routes,
    render (routerProps, renderCallback) {
      // here is your chance to load up data before rendering and pass it to
      // your top-level components
      renderCallback(null, {
        renderDocument: (props) => <Document {...props} />,
        renderApp: (props) => <RouterContext {...props} />,
      })
    },
  })
}

createServer(getApp).start()
