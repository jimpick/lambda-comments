import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { uploadWebsite } from '../src/server/lib/s3'

dotenv.config()

const filename = 'lambda-comments.js'
const buildDir = path.normalize(`${__dirname}/../packages/frontend/.build`)
const jsFile = fs.readFileSync(path.join(buildDir, filename), 'utf8')

async function run () {
  await uploadWebsite({
    key: filename,
    data: jsFile,
    contentType: 'application/javascript'
  })
  console.log(`${filename} uploaded to S3 bucket.`)
}
run()
