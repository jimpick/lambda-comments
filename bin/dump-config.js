import { parse } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const { protocol, host } = parse(process.env.BLOG)
process.env.ORIGIN = `${protocol}//${host}`

console.log(process.env[process.argv[2]])
