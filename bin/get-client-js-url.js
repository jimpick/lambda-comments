import dotenv from 'dotenv'
import { getClientJsUrl } from '../src/server/lib/cloudFormation'

dotenv.config()

console.log(getClientJsUrl())
