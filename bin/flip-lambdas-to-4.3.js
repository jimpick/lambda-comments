import AWS from 'aws-sdk'
import { resources } from 'lambda-comments-utils/src/cloudFormation'
import dotenv from 'dotenv'

dotenv.config()

const lambda = new AWS.Lambda({
  region: process.env.REGION
})

function update (functionName) {
  return new Promise((resolve, reject) => {
    const params = {
      FunctionName: functionName,
      Runtime: 'nodejs4.3'
    }
    lambda.updateFunctionConfiguration(params, (error, data) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

async function run () {
  try {
    const functions = [
      'QueueCommentLambdaFunction',
      'WorkerLambdaFunction'
    ]
    for (let func of functions) {
      console.log(`Updating function ${func} to Node 4.3`)
      const funcName = resources[func].PhysicalResourceId
      await update(funcName)
    }
    console.log('Done.')
  } catch (error) {
    console.error(error)
    console.error(error.stack)
    process.exit(1)
  }
}

run()
