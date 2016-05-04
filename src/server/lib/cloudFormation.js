import cloudFormation from '../../../deploy/state/cloudFormation.json'

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

export function getApiUrl () {
  const { REGION: region, STAGE: stage } = process.env
  return (
    'https://' +
    resources.RestApi.PhysicalResourceId +
    '.execute-api.' +
    region +
    '.amazonaws.com/' +
    stage
  )
}

export function getWebsiteUrl () {
  const { REGION: region } = process.env
  return (
    `https://s3-${region}.amazonaws.com/` +
    resources.WebsiteS3.PhysicalResourceId
  )
}

export default cloudFormation
