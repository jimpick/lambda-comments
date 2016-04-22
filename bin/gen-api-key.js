import path from 'path'
import fs from 'fs'
import slugid from 'slugid'
import mkdirp from 'mkdirp'

const json = { apiKey: slugid.v4() }
const stateDir = path.normalize(`${__dirname}/../deploy/state`)
mkdirp.sync(stateDir)
fs.writeFileSync(`${stateDir}/apiKey.json`, JSON.stringify(json))
console.log('deploy/state/apiKey.json created')
