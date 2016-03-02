import lambdaWrapper from '../../lib/lambdaWrapper'

export async function handler (...opts) {
  await lambdaWrapper(opts, async event => {
    const { quiet, url } = event
    if (!quiet) {
      console.log(JSON.stringify(event, null, 2))
    }
    return event
  })
}
