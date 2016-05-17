import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from 'lambda-comments-utils/src/cloudFormation'

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
                  S: '2016/04/23/17:34-xmZXF7R1RPCekSqC1b4FXA',
                },
                dirName: {
                  S: 'comments/post/good-to-great'
                }
              }
            }
          }
        ]
      }
      event.quiet = true
      event.dryRun = true // FIXME: We should mock the HTTP and AWS calls
      handler(event, null, error => {
        expect(error).to.be.null
        done()
      })
    })

  })

}
