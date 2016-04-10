import React from 'react'
import { Route } from 'react-router'
import App from './components/App'
import Comments from './components/Comments'

export default (store) => (
  <Route>
    <Route path="/" component={App}>
      <Route path="**" component={Comments}/>
    </Route>
  </Route>
)
