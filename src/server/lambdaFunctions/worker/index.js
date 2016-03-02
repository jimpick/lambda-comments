import lambdaWrapper from '../../lib/lambdaWrapper'

export async function handler (...opts) {
  await lambdaWrapper(opts, async event => {
    const {
      Records: [
        {
          dynamodb: {
            NewImage: {
              jobRef: {
                S: jobRef
              },
              url: {
                S: url
              }
            }
          }
        }
      ],
      quiet
    } = event
    if (!quiet) {
      // console.log(JSON.stringify(event, null, 2))
      console.log('jobRef:', jobRef)
      console.log('url:', url)
    }
    return event
  })
}
