import Slack from 'node-slack'
import WError from 'verror'
import config from '../../../config'

const { slackWebhook } = config
const slack = slackWebhook ? new Slack(slackWebhook) : null

export function postToSlack ({ message, quiet }) {
  if (!slack) {
    return Promise.resolve()
  }
  if (!quiet) {
    console.log('Posting to Slack')
  }
  const promise = slack.send(message)
    .catch(error => {
      throw new WError(err, 'Slack')
    })
  return promise
}
