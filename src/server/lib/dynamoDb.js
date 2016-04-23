import AWS from 'aws-sdk'
import WError from 'verror'
import config from '../../../config'
import { resources } from './cloudFormation'

const { region } = config
const awsDynamoDb = new AWS.DynamoDB({ region })
const dynamoDbTable = resources.JobStreamDynamoDBTable.PhysicalResourceId

export function updateRecord (object) {
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
        return reject(new WError(err, 'S3'))
      }
      resolve(result)
    })
  })
}
