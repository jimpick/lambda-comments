import path from 'path'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import { resources as cloudFormationResources } from '../../deploy/state/cloudFormation.json'

const nodeModulesDir = path.normalize(`${__dirname}/../../node_modules`)

const resources = cloudFormationResources.reduce((prev, resource) => {
  const {
    LogicalResourceId,
    PhysicalResourceId,
    StackId
  } = resource
  return {
    [LogicalResourceId]: { PhysicalResourceId, StackId },
    ...prev
  }
}, {})

const lambdas = [
  'ListActiveJobs',
  'GetJobStatus',
  'QueueJob',
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
    [lambdaDirNames['ListActiveJobs']]: [
      'babel-polyfill',
      './src/server/lambdaFunctions/listActiveJobs/index.js'
    ],
    [lambdaDirNames['GetJobStatus']]: [
      'babel-polyfill',
      './src/server/lambdaFunctions/getJobStatus/index.js'
    ],
    [lambdaDirNames['QueueJob']]: [
      'babel-polyfill',
      './src/server/lambdaFunctions/queueJob/index.js'
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
    new StringReplacePlugin()
  ],
  // From: https://github.com/webpack/webpack/issues/784
  // for modules
  resolve: {
    fallback: [ nodeModulesDir ]
  },
  // same issue, for loaders like babel
  resolveLoader: {
    fallback: [ nodeModulesDir ]
  }
}
