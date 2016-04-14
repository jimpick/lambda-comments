import { ClientConfig, ServerConfig } from 'react-project/webpack'
import postcssNested from 'postcss-nested'
import { DefinePlugin } from 'webpack'
import 'babel-register'
import { apiUrl, websiteUrl } from '../../../src/server/lib/cloudFormation'
import config from '../../../config.js'

function modify (webpackConfig) {
  webpackConfig.postcss = () => {
    return [ postcssNested ]
  }
  if (webpackConfig.entry.app) {
    webpackConfig.entry.app = [
      'babel-polyfill',
      webpackConfig.entry.app
    ]
 }
}

function modifyClient (webpackConfig) {
  let { output: { filename }, plugins, module: { loaders } } = webpackConfig
  modify(webpackConfig)
  console.log('Output filename before', filename)
  filename = filename.replace('[chunkHash].js', '[name].js')
  webpackConfig.output.filename = filename
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

  plugins.push(new DefinePlugin({
    '__CONFIG__': JSON.stringify({
      apiUrl,
      websiteUrl
    })
  }))
  webpackConfig.plugins = plugins
  console.log('Plugins after', plugins)
  console.log('Loaders before', loaders)
  loaders.forEach(loader => {
    if (loader.test.source === '\\.css$') {
      loader.loader = 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    }
  })
  webpackConfig.module.loaders = loaders
  console.log('Loaders after', loaders)
}

modifyClient(ClientConfig)
modify(ServerConfig)

export { ClientConfig, ServerConfig }
