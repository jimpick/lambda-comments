import '../modules/styles.css'
import React from 'react'
import { Route } from 'react-router'
import App from './components/App'
import Comments from './components/Comments'

export default (
  <Route>
    <Route path="/" component={App}>
      <Route path="**" component={Comments}/>
    </Route>
  </Route>
)
