import path from 'path'
import dotenv from 'dotenv'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import { resources } from 'lambda-comments-utils/src/cloudFormation'
import { DefinePlugin, NormalModuleReplacementPlugin } from 'webpack'

dotenv.config()

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

const defines = {
  'global.GENTLY': false,
  'process.env.BLOG': `'${process.env.BLOG}'`,
  'process.env.REGION': `'${process.env.REGION}'`,
  'process.env.STAGE': `'${process.env.STAGE}'`,
}

if (process.env.AKISMET) {
  defines['process.env.AKISMET'] = `'${process.env.AKISMET}'`
}

if (process.env.SLACK) {
  defines['process.env.SLACK'] = `'${process.env.SLACK}'`
}

if (process.env.REQEMAIL) {
  defines['process.env.REQEMAIL'] = `'${process.env.REQEMAIL}'`
}

if (process.env.REQNAME) {
  defines['process.env.REQNAME'] = `'${process.env.REQNAME}'`
}


export default {
  entry: {
    [lambdaDirNames['QueueComment']]: [
      'babel-polyfill',
      './packages/lambda/src/queueComment/index.js'
    ],
    [lambdaDirNames['Worker']]: [
      'babel-polyfill',
      './packages/lambda/src/worker/index.js'
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
    new DefinePlugin(defines),
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
