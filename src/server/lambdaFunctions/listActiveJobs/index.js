console.log('Loading event')

exports.handler = function (event, context) {
  console.log('Jim3', event, context)
  context.done(null, 'Hello World 5: ' + JSON.stringify(event) + '\n' +
    JSON.stringify(context))
}
