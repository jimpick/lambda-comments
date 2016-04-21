import akismet from 'akismet'
import promisify from 'es6-promisify'
import config from '../../../config'

const { akismet: apiKey, blog } = config

export default class Akismet {
  constructor () {
    this.client = akismet.client({ blog, apiKey })
    const methods = [ 'verifyKey', 'checkSpam', 'submitSpam', 'submitHam' ]
    methods.forEach(method => {
      const wrappedMethod = promisify(this.client[method])
      this[method] = () => {
        if (!apiKey) {
          throw new Error('Missing Akismet API Key')
        }
        return wrappedMethod
      }
    })
  }

  configured () {
    return !!apiKey
  }

}
