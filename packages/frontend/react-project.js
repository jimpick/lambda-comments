// This is an alternative top-level for react-project
// that knows to run certain external files through
// babel

require('babel-polyfill')
require('babel-register')({
  ignore: function (filename) {
    if (filename.match(/lambda-comments-utils\/src/)) {
      return false
    }
    return filename.match(/node_modules/)
  }
})

var dotenv = require('dotenv')
var path = require('path')

dotenv.load({
  path: process.cwd() + '/.env',
  silent: true
})

require('react-project/lib/cli')

