import akismet from 'akismet-api'
import config from '../../../config'

const { akismet: apiKey, blog } = config

export default class Akismet {
  constructor () {
    this.client = akismet.client({ blog, key: apiKey })
  }

  configured () {
    return !!apiKey
  }

  verifyKey () {
    if (!apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.verifyKey()
  }

  checkSpam (options) {
    if (!apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.checkSpam({ blog, ...options })
  }

  submitSpam (options) {
    if (!apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.submitSpam({ blog, ...options })
  }

  submitHam (options) {
    if (!apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.submitHam({ blog, ...options })
  }

}
