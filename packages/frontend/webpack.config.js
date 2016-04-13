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

function modifyClient (config) {
  let { output: { filename }, plugins, module: { loaders } } = config
  modify(config)
  console.log('Output filename before', filename)
  filename = filename.replace('[chunkHash].js', '[name].js')
  config.output.filename = filename
  console.log('Output filename after', filename)
  console.log('Plugins before', plugins)
  plugins = plugins.filter(plugin => {
    const name = plugin.constructor.name
    return name !== 'ExtractTextPlugin'
  })
  plugins.forEach(plugin => {
    const name = plugin.constructor.name
    if (name === 'CommonsChunkPlugin' && plugin.chunkNames === '_vendor') {
      plugin.filenameTemplate = 'vendor.js'
    }
  })
  config.plugins = plugins
  console.log('Plugins after', plugins)
  console.log('Loaders before', loaders)
  loaders.forEach(loader => {
    if (loader.test.source === '\\.css$') {
      loader.loader = 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    }
  })
  config.module.loaders = loaders
  console.log('Loaders after', loaders)
}

modifyClient(ClientConfig)
modify(ServerConfig)

export { ClientConfig, ServerConfig }
