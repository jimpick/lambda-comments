import Slack from 'node-slack'
import WError from 'verror'

export function postToSlack ({ message, quiet }) {
  const { SLACK: slackWebhook } = process.env
  const slack = slackWebhook ? new Slack(slackWebhook) : null

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
