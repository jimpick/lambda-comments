export function handler (event, context) {
  const { jobId } = event
  console.log('Jim', event)
  context.done(null, { jobId })
}
