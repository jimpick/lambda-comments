import nodeUrl from 'url'
import path from 'path'
import superagent from 'superagent'
import superagentPromisePlugin from 'superagent-promise-plugin'
import lambdaWrapper from '../../lib/lambdaWrapper'
import { upload } from '../../lib/s3'

async function uploadHttpResponse({ jobRef, url, response }) {
  const jobDir = `jobs/${jobRef}`
  const { statusCode, text: data, type: contentType } = response
  const { pathname } = nodeUrl.parse(url)
  const basename = path.basename(pathname)
  const filename = basename ? basename : 'index.html'
  const responseInfo = {
    statusCode,
    contentType,
    filename
  }
  await upload({
    key: `${jobDir}/responseInfo.json`,
    data: JSON.stringify(responseInfo),
    contentType: 'application/json'
  })
  await upload({
    key: `${jobDir}/response/${filename}`,
    data,
    contentType
  })
}

async function downloadAndSave ({ jobRef, url }) {
  // FIXME: Stream response to S3 object so we can handler
  // larger objects
  const response = await superagent
    .get(url)
    .use(superagentPromisePlugin)
    .end()
  const { statusCode } = response
  await uploadHttpResponse({ jobRef, url, response })
}

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
      quiet,
      dryRun
    } = event
    if (!quiet) {
      // console.log(JSON.stringify(event, null, 2))
      console.log('jobRef:', jobRef)
      console.log('url:', url)
    }
    if (!dryRun) {
      await downloadAndSave({ jobRef, url })
    }
  })
}
