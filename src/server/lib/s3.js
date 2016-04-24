import AWS from 'aws-sdk'
import WError from 'verror'
import config from '../../../config'
import { resources } from './cloudFormation'

const { region } = config
const awsS3 = new AWS.S3({ region })
const websiteBucket = resources.WebsiteS3.PhysicalResourceId
const privateBucket = resources.PrivateS3.PhysicalResourceId

function upload ({
  s3Bucket,
  key,
  data,
  contentType = 'application/octet-stream'
}) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: s3Bucket
    , Key: key
    , Body: data
    , ContentType: contentType
    }
    awsS3.putObject(params, (err, result) => {
      if (err) {
        return reject(new WError(err, 'S3'))
      }
      resolve()
    })
  })
}

export function uploadPrivate (params) {
  const s3Bucket = privateBucket
  return upload({ ...params, s3Bucket })
}

export function uploadWebsite (params) {
  const s3Bucket = websiteBucket
  return upload({ ...params, s3Bucket })
}

export function download ({ s3Bucket, key }) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: s3Bucket
    , Key: key
    }
    awsS3.getObject(params, (err, result) => {
      if (err) {
        return reject(new WError(err, 'S3'))
      }
      resolve(result)
    })
  })
}

export function downloadPrivate (params) {
  const s3Bucket = privateBucket
  return download({ ...params, s3Bucket })
}

export function downloadWebsite (params) {
  const s3Bucket = websiteBucket
  return download({ ...params, s3Bucket })
}
