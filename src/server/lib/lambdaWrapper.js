import util from 'util'

export default async function ([ event, context ], fn) {
  try {
    const { done } = context
    const result = await fn(event)
    done(null, result)
  } catch(error) {
    const { fail } = context
    // FIXME: Investigate API Gateway error handling best practices
    if (typeof error === 'object') {
      // Need to turn into a string for Lambda
      fail(util.inspect(error))
    } else {
      fail(error)
    }
  }
}
