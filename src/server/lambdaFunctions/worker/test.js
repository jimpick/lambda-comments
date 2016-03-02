import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'
import { expect } from 'chai'
import { handler } from './index'

export function local () {

  describe('Post an event to the worker', function () {

    this.timeout(5000)

    it('should return a jobRef', function (done) {
      const event = {
        url: 'http://example.com/',
        quiet: true
        // dryRun: true
      }
      handler(event, {
        done: (error, body) => {
          // console.log('Jim', body)
          done()
        },
        fail: error => { console.log(error) }
      })
    })

  })

}
