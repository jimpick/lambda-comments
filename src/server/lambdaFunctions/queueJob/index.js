import moment from 'moment'
import { generateReference } from '../../lib/references'

export function handler (event, context) {
  const { url } = event
  const now = moment.utc()
  const jobRef = generateReference(now)
  context.done(null, { jobRef, submittedDate: now })
}
