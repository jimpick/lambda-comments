import { parse } from 'url'
import config from '../config'

const { protocol, host } = parse(config.blog)
config.origin = `${protocol}//${host}`

console.log(config[process.argv[2]])
