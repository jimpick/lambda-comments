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

function describeStack ({ cloudFormation, stackName }) {
  return new Promise((resolve, reject) => {
    const params = {
      StackName: stackName
    }
    cloudFormation.describeStacks(params, (error, data) => {
      if (error) {
        return reject(error)
      }
      if (!data) {
        return reject(new Error('describeStacks returned no data'))
      }
      const { Stacks: stacks } = data
      if (!stacks || stacks.length !== 1) {
        return reject(new Error('describeStacks unexpected number of stacks'))
      }
      const stack = stacks[0]
      resolve(stack)
    })
  })
}


async function run () {
  try {
    const { cloudFormation: stackName, region } = config
    const cloudFormation = new AWS.CloudFormation({ region })
    const resources = await describeStackResources({ cloudFormation, stackName })
    const stack = await describeStack({ cloudFormation, stackName })
    const result = { stack, resources }
    const json = JSON.stringify(result, null, 2)
    fs.writeFileSync(`${__dirname}/../cloudFormation.json`, json)
    console.log('cloudFormation.json written')
  } catch (error) {
    console.error(error, error.stack)
  }
}

run()
