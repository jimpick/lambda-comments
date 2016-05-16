import https from 'https'
import AWS from 'aws-sdk'
import WError from 'verror'
import { resources } from './cloudFormation'

const dynamoDbTable = resources.JobStreamDynamoDBTable.PhysicalResourceId

export function updateRecord (object) {
  const { REGION: region } = process.env
  // Include workaround from: https://github.com/aws/aws-sdk-js/issues/862
  const awsDynamoDb = new AWS.DynamoDB({
    region,
    httpOptions: {
      agent: new https.Agent({
        rejectUnauthorized: true,
        // keepAlive: true,                // workaround part i.
                                        // shouldn't be used in AWS Lambda functions
        secureProtocol: "TLSv1_method", // workaround part ii.
        ciphers: "ALL"                  // workaround part ii.
      })
    }
  })
  return new Promise((resolve, reject) => {
    const params = {
      TableName: dynamoDbTable,
      Key: { id: { S: 'jobs' } },
      AttributeUpdates: Object.keys(object).reduce((prev, key) => ({
        [key]: {
          Action: 'PUT',
          Value: {
            S: object[key]
          }
        },
        ...prev
      }), {})
    }
    awsDynamoDb.updateItem(params, (err, result) => {
      if (err) {
        return reject(new WError(err, 'DynamoDB'))
      }
      resolve(result)
    })
  })
}
