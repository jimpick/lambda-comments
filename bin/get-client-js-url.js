import dotenv from 'dotenv'
import { getClientJsUrl } from 'lambda-comments-utils/src/cloudFormation'

dotenv.config()

console.log(getClientJsUrl())
