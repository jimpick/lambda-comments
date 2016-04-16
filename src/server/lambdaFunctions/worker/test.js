import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'
import { expect } from 'chai'
import { handler } from './index'

export function local () {

  describe('Worker', function () {

    this.timeout(5000)

    it('should process the action', function (done) {
      const event = {
        Records: [
          {
            dynamodb: {
              NewImage: {
                actionRef: {
                  S: '2016/04/15/19:44-eBnt3nJpQ6mGzbs2HZz9xw',
                },
                dirName: {
                  S: 'comments/post/good-to-great'
                }
              }
            }
          }
        ]
      }
      // event.quiet = true
      // event.dryRun = true // FIXME: We should mock the HTTP and AWS calls
      handler(event, {
        done: (error, body) => {
          done()
        },
        fail: error => {
          console.log(error)
        }
      })
    })

  })

}
