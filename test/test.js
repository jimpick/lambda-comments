import 'babel-polyfill'

const lambdaFunctions = [
  'getJobStatus',
  // 'listActiveJobs',
  'queueJob'
  // 'worker'
]
const localTests = lambdaFunctions.reduce((prev, test) => ({
  [test]: require(`../src/server/lambdaFunctions/${test}/test`).local,
  ...prev
}), {})
const remoteTests = lambdaFunctions.reduce((prev, test) => ({
  [test]: require(`../src/server/lambdaFunctions/${test}/test`).remote,
  ...prev
}), {})

function local () {
  describe('local', function () {
    Object.values(localTests).forEach(test => {
      test()
    })
  })
}

function remote () {
  describe('remote', function () {
    Object.values(remoteTests).forEach(test => {
      test()
    })
  })
}

local()
remote()
