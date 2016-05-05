import akismet from '@jimpick/akismet-api'

export default class Akismet {
  constructor () {
    const { AKISMET: apiKey, BLOG: blog } = process.env

    this.client = akismet.client({ blog, key: apiKey })
    this.apiKey = apiKey
    this.blog = blog
  }

  configured () {
    return !!this.apiKey
  }

  verifyKey () {
    if (!this.apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.verifyKey()
  }

  checkSpam (options) {
    if (!this.apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.checkSpam({ blog: this.blog, ...options })
  }

  submitSpam (options) {
    if (!this.apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.submitSpam({ blog: this.blog, ...options })
  }

  submitHam (options) {
    if (!this.apiKey) {
      throw new Error('Missing Akismet API Key')
    }
    return this.client.submitHam({ blog: this.blog, ...options })
  }

}
