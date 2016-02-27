console.log('Loading event')

exports.handler = function (event, context) {
  const { jobId } = event
  console.log('Jim', event)
  context.done(null, { jobId })
}
