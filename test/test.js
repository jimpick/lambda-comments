import 'babel-polyfill'
import dotenv from 'dotenv'

dotenv.config()

const lambdaFunctions = [
  'queueComment',
  'worker'
]
const localTests = lambdaFunctions.reduce((prev, test) => ({
  [test]: require(`../packages/lambda/src/${test}/test`).local,
  ...prev
}), {})
const remoteTests = lambdaFunctions.reduce((prev, test) => ({
  [test]: require(`../packages/lambda/src/${test}/test`).remote,
  ...prev
}), {})

function local () {
  describe('local', function () {
    Object.values(localTests).forEach(test => {
      test && test()
    })
  })
}

function remote () {
  describe('remote', function () {
    Object.values(remoteTests).forEach(test => {
      test && test()
    })
  })
}

local()
remote()
