import AWS from 'aws-sdk'
import WError from 'verror'
import { resources } from './cloudFormation'

const dynamoDbTable = resources.JobStreamDynamoDBTable.PhysicalResourceId

export function updateRecord (object) {
  const { REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB({ region })
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
