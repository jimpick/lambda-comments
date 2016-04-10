import React from 'react'
import { Route } from 'react-router'
import App from './ui/app'
import Comments from './ui/comments'

export default (store) => (
  <Route>
    <Route path="/" component={App}>
      <Route path="**" component={Comments}/>
    </Route>
  </Route>
)
