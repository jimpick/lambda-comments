import cloudFormation from '../../../deploy/state/cloudFormation.json'
import config from '../../../config'

const {
  stack: {
    Outputs: cloudFormationOutputs
  },
  resources: cloudFormationResources
} = cloudFormation

export const outputs = cloudFormationOutputs.reduce((prev, output) => {
  const { OutputKey, OutputValue } = output
  return {
    [OutputKey]: OutputValue,
    ...prev
  }
}, {})

export const resources = cloudFormationResources.reduce((prev, resource) => {
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

const { region } = config

export const apiUrl = 'https://' +
  resources.RestApi.PhysicalResourceId +
  '.execute-api.' +
  region +
  '.amazonaws.com/prod'

export default cloudFormation
