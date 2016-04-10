import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import { routerMiddleware } from 'react-router-redux'

export default function configureStore (initialState = {}, history) {
  // Compose final middleware and use devtools in debug environment
  const middleware = applyMiddleware(thunk, routerMiddleware(history))

  // Create final store and subscribe router in debug env ie. for devtools
  const store = middleware(createStore)(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default

      store.replaceReducer(nextRootReducer)
    })
  }
  return store
}
