import { ClientConfig, ServerConfig } from 'react-project/webpack'
import postcssNested from 'postcss-nested'

function modify (config) {
  config.postcss = () => {
    return [ postcssNested ]
  }
}

modify(ClientConfig)
modify(ServerConfig)

export { ClientConfig, ServerConfig }
