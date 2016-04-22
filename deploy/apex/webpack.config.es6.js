import path from 'path'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import { resources } from '../../src/server/lib/cloudFormation'
import { DefinePlugin, NormalModuleReplacementPlugin } from 'webpack'

const nodeModulesDir = path.normalize(`${__dirname}/../../node_modules`)

const lambdas = [
  'QueueComment',
  'Worker'
]

const lambdaDirNames = lambdas.reduce((lookupTable, logicalResourceId) => {
  const resource = resources[`${logicalResourceId}LambdaFunction`]
  const lambdaDirName = resource.PhysicalResourceId.replace(/^[^-]+-/, '')
  return {
    [logicalResourceId]: lambdaDirName,
    ...lookupTable
  }
}, {})

export default {
  entry: {
    [lambdaDirNames['QueueComment']]: [
      'babel-polyfill',
      './src/server/lambdaFunctions/queueComment/index.js'
    ],
    [lambdaDirNames['Worker']]: [
      'babel-polyfill',
      './src/server/lambdaFunctions/worker/index.js'
    ]
  },
  output: {
    path: "./build/apex/functions",
    library: "[name]",
    libraryTarget: "commonjs2",
    filename: "[name]/index.js"
  },
  target: "node",
  externals: { 'aws-sdk': 'commonjs aws-sdk' },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [ 'es2015', 'stage-0' ]
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /validate.js$/,
        include: /node_modules\/json-schema/,
        loader: StringReplacePlugin.replace({ // from the 'string-replace-webpack-plugin'
          replacements: [{
            pattern: /\(\{define:typeof define!="undefined"\?define:function\(deps, factory\)\{module\.exports = factory\(\);\}\}\)\./ig,
            replacement: function(match, p1, offset, string) {
              return false;
            }
          }]
        })
      }
    ]
  },
  plugins: [
    // https://github.com/andris9/encoding/issues/16
    new NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    new StringReplacePlugin(),
    // https://github.com/visionmedia/superagent/wiki/Superagent-for-Webpack
    new DefinePlugin({ "global.GENTLY": false }),
  ],
  // From: https://github.com/webpack/webpack/issues/784
  // for modules
  resolve: {
    fallback: [ nodeModulesDir ]
  },
  // same issue, for loaders like babel
  resolveLoader: {
    fallback: [ nodeModulesDir ]
  },
  /* node: {
    // https://github.com/visionmedia/superagent/wiki/Superagent-for-Webpack
    __dirname: true,
  } */
}
