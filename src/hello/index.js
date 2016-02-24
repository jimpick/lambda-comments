console.log('Loading event')

exports.handler = function (event, context) {
  context.done(null, "Hello World")
}

