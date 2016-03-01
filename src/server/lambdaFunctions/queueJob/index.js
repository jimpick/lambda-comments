import util from 'util'
import moment from 'moment'
import { generateReference } from '../../lib/references'
import { upload } from '../../lib/s3'

function uploadJson({ dirName, jobRef, jobInfo }) {
  return upload({
    key: `${dirName}/${jobRef}/upload.json`,
    data: JSON.stringify(jobInfo),
    contentType: 'application/json'
  })
}

export async function handler (event, context) {
  try {
    const { done } = context
    const { url, dryRun } = event
    if (!url) {
      throw new Error('Missing url')
    }
    const now = moment.utc()
    const jobRef = generateReference(now)
    const jobInfo = {
      jobRef,
      submittedDate: now.toISOString()
    }
    if (!dryRun) {
      await uploadJson({ dirName: 'jobs', jobRef, jobInfo })
    }
    done(null, jobInfo)
  } catch (error) {
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
