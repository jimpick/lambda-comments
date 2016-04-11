import React from 'react'
import { Route } from 'react-router'
import App from './ui/app'
import CommentsContainer from './ui/commentsContainer'

export default () => (
  <Route>
    <Route path="/" component={App}>
      <Route path="**" component={CommentsContainer} />
    </Route>
  </Route>
)
