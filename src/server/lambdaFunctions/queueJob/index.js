exports.handler = function (event, context) {
  console.log('Post', event)
  context.done(null, { jobId: 'mock id'})
}
