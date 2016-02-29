import util from 'util'
import moment from 'moment'
import { generateReference } from '../../lib/references'

export function handler (event, context) {
  try {
    const { done } = context
    const { url } = event
    if (!url) {
      throw new Error('Missing url')
    }
    const now = moment.utc()
    const jobRef = generateReference(now)
    const jobInfo = {
      jobRef,
      submittedDate: now.toISOString()
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
