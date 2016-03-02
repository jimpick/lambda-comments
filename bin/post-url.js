import superagent from 'superagent'
import superagentPromisePlugin from 'superagent-promise-plugin'
import config from '../config'
import { resources } from '../src/server/lib/cloudFormation'

const { region, stage } = config
const restApiId = resources.RestApi.PhysicalResourceId

const apiHost = `${restApiId}.execute-api.${region}.amazonaws.com`
const apiUrl = `https://${apiHost}/${stage}`

async function run () {
  const url = process.argv[2]
  if (!url) {
    console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <url>`)
    process.exit(1)
  }
  try {
    console.log('Submitting URL:', url)
    const response = await superagent
      .post(`${apiUrl}/jobs`)
      .send({ url })
      .use(superagentPromisePlugin)
      .end()
    const { statusCode, body } = response
    if (statusCode === 200) {
      console.log(body)
    } else {
      console.error('Error', statusCode)
      console.error(body)
      process.exit(1)
    }
  } catch (error) {
    console.error(error)
    console.error(error.stack)
  }
}

run()
