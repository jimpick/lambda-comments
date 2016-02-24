import fs from 'fs'
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
fs.writeFileSync(
  `${__dirname}/../deploy/apex/project.json`,
  JSON.stringify(apexProjectTemplate, null, 2)
)
console.log('project.json written')
