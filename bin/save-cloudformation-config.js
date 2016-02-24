import fs from 'fs'
import AWS from 'aws-sdk'
import config from '../config'

function describeStackResources ({ cloudFormation, stackName }) {
  return new Promise((resolve, reject) => {
    const params = {
      StackName: stackName
    }
    cloudFormation.describeStackResources(params, (error, data) => {
      if (error) {
        return reject(error)
      }
      const { StackResources: resources } = data
      resolve(resources)
    })
  })
}

async function run () {
  try {
    const { cloudFormation: stackName, region } = config
    const cloudFormation = new AWS.CloudFormation({ region })
    const resources = await describeStackResources({
      cloudFormation,
      stackName
    })
    const json = JSON.stringify(resources, null, 2)
    fs.writeFileSync(`${__dirname}/../cloudFormation.json`, json)
    console.log('cloudFormation.json written')
  } catch (error) {
    console.error(error, error.stack)
  }
}

run()
