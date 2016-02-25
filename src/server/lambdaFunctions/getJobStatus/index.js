console.log('Loading event')

exports.handler = function (event, context) {
  console.log('Jim', event, context)
  context.done(null, 'Hello World 2: ' + JSON.stringify(event) + '\n' +
    JSON.stringify(context))
}
