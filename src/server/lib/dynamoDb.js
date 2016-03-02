import AWS from 'aws-sdk'
import config from '../../../config'
import { resources } from './cloudFormation'

const { region } = config
const awsDynamoDb = new AWS.DynamoDB({ region })
const dynamoDbTable = resources.JobStreamDynamoDBTable.PhysicalResourceId

export function updateRecord ({
  key,
  value
}) {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: dynamoDbTable,
      Key: { id: { S: 'jobs' } },
      AttributeUpdates: {
        [key]: {
          Action: 'PUT',
          Value: {
            S: value
          }
        }
      }
      // ReturnConsumedCapacity: 'TOTAL'
    }
    awsDynamoDb.updateItem(params, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}
