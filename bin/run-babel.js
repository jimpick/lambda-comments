require('babel-polyfill')
require('babel-register')({
  ignore: function (filename) {
    if (filename.match(/lambda-comments-utils\/src/)) {
      return false
    }
    return filename.match(/node_modules/)
  }
})

// console.log(process.argv[2])
require(process.argv[2])
