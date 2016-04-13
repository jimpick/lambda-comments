import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import { routerMiddleware } from 'react-router-redux'
import createLogger from 'redux-logger'

export default function configureStore (initialState = {}, history) {
  const middlewareList = [
    thunk,
    routerMiddleware(history),
  ]

  if (process.env.NODE_ENV === 'development') {
    const logger = createLogger({ collapsed: true })
    middlewareList.push(logger)
  }

  // Compose final middleware and use devtools in debug environment
  const middleware = applyMiddleware.apply(null, middlewareList)

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
