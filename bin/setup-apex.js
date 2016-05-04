import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import dotenv from 'dotenv'
import { outputs } from '../src/server/lib/cloudFormation'

dotenv.config()

const apexProjectTemplate = {
  name: process.env.CLOUDFORMATION,
  description: 'lambda-comments Lambda Functions',
  memory: 128,
  timeout: 30,
  runtime: 'nodejs4.3',
  shim: false,
  role: outputs.LambdaRoleArn,
  nameTemplate: '{{.Project.Name}}-{{.Function.Name}}',
  handler: 'index.handler'
}
const json = JSON.stringify(apexProjectTemplate, null, 2)
const buildDir = path.normalize(`${__dirname}/../build/apex`)
rimraf.sync(buildDir)
mkdirp.sync(buildDir)
fs.writeFileSync(`${buildDir}/project.json`, json)
console.log('build/apex/project.json created')
