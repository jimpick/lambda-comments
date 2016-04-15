import nodeUrl from 'url'
import path from 'path'
import fetch from 'node-fetch'
import lambdaWrapper from '../../lib/lambdaWrapper'
import { upload } from '../../lib/s3'

export async function handler (...opts) {
  await lambdaWrapper(opts, async event => {
    const {
      Records: [
        {
          dynamodb: {
            NewImage: {
              actionRef: {
                S: actionRef
              }
            }
          }
        }
      ],
      quiet,
      dryRun
    } = event
    if (!quiet) {
      // console.log(JSON.stringify(event, null, 2))
      console.log('actionRef:', actionRef)
    }
    if (!dryRun) {
      // await downloadAndSave({ jobRef, url })
    }
  })
}
