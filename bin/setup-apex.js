import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import config from '../config'
import cloudFormationResources from '../cloudFormation'

const resources = cloudFormationResources.reduce((prev, resource) => {
  const {
    LogicalResourceId,
    PhysicalResourceId,
    StackId
  } = resource
  return {
    [LogicalResourceId]: { PhysicalResourceId, StackId },
    ...prev
  }
}, {})

const apexProjectTemplate = {
  name: config.cloudFormation,
  description: 'Scraper Queue Lambda Functions',
  memory: 128,
  timeout: 120,
  role: resources.LambdaRole.StackId,
  nameTemplate: '{{.Project.Name}}-{{.Function.Name}}',
  handler: 'index.handler'
}
const json = JSON.stringify(apexProjectTemplate, null, 2)
const buildDir = path.normalize(`${__dirname}/../build/apex`)
rimraf.sync(buildDir)
mkdirp.sync(buildDir)
fs.writeFileSync(`${buildDir}/project.json`, json)
console.log('build/apex/project.json created')
