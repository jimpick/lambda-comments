import dotenv from 'dotenv'
import { ClientConfig, ServerConfig } from 'react-project/webpack'
import postcssNested from 'postcss-nested'
import { DefinePlugin } from 'webpack'
import 'babel-register'
import { apiKey } from '../../../deploy/state/apiKey.json'
import { getApiUrl, getWebsiteUrl } from
  'lambda-comments-utils/src/cloudFormation'

dotenv.config()
dotenv.config({ path: '../../.env' })

const apiUrl = getApiUrl()
const websiteUrl = getWebsiteUrl()
const { REQEMAIL: authorEmailRequired, REQNAME: authorNameRequired } = process.env
const { SIZELIMIT: contentSizeLimit, DISALLOW_EMPTY: disallowEmptyContent } = process.env


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
  let {
    entry,
    devtool,
    output: {
      filename
    },
    plugins,
    module: {
      loaders
    }
  } = webpackConfig
  modify(webpackConfig)
  if (process.env.NODE_ENV === 'production') {
    delete webpackConfig.devtool
    console.log('Devtool cleared')
  } else {
    console.log('Devtool before', devtool)
    devtool = devtool.replace(
      'cheap-module-eval-source-map',
      'cheap-source-map'
    )
    webpackConfig.devtool = devtool
  console.log('Devtool after', devtool)
  }
  console.log('Entry before', entry)
  entry['lambda-comments'] = entry.app
  delete entry.app
  delete entry._vendor
  console.log('Entry after', entry)
  console.log('Output filename before', filename)
  filename = filename.replace('[chunkHash].js', '[name].js')
  webpackConfig.output.filename = filename
  console.log('Output filename after', filename)
  console.log('Plugins before', plugins)
  plugins = plugins.filter(plugin => {
    const name = plugin.constructor.name
    return name !== 'ExtractTextPlugin' && name !== 'CommonsChunkPlugin'
  })

  plugins.push(new DefinePlugin({
    '__CONFIG__': JSON.stringify({
      apiUrl,
      websiteUrl,
      apiKey,
      authorNameRequired,
      authorEmailRequired,
      contentSizeLimit,
      disallowEmptyContent
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
  // Fix for: https://github.com/isagalaev/highlight.js/issues/895
  webpackConfig.module.noParse = [/autoit.js/]
}

modifyClient(ClientConfig)
modify(ServerConfig)

/*
// Uncomment when adapting webpack config
console.log('\n\n\n')
console.log(JSON.stringify(ClientConfig, null, 2))
process.exit(1)
*/

export { ClientConfig, ServerConfig }
