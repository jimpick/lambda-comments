import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import config from '../config'
import cloudFormation from '../cloudFormation.json'

const {
  stack: {
    Outputs: cloudFormationOutputs
  }
} = cloudFormation

const outputs = cloudFormationOutputs.reduce((prev, output) => {
  const { OutputKey, OutputValue } = output
  return {
    [OutputKey]: OutputValue,
    ...prev
  }
}, {})

const apexProjectTemplate = {
  name: config.cloudFormation,
  description: 'Scraper Queue Lambda Functions',
  memory: 128,
  timeout: 120,
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
