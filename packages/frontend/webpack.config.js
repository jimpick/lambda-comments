import { ClientConfig, ServerConfig } from 'react-project/webpack'
import postcssNested from 'postcss-nested'

function modify (config) {
  config.postcss = () => {
    return [ postcssNested ]
  }
  if (config.entry.app) {
    config.entry.app = [
      'babel-polyfill',
      config.entry.app
    ]
  }
}

modify(ClientConfig)
modify(ServerConfig)

export { ClientConfig, ServerConfig }
