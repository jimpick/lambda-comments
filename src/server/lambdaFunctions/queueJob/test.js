import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'
import { expect } from 'chai'

export function local () {
}

export function remote () {

  describe('Post new job and get jobId', function () {

    function testResponse(request, done) {
      request
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(({ body }) => {
          expect(body).to.be.a('object')
          const { jobId } = body
          expect(jobId).to.be.a('string')
        })
        .end(done)
    }

    it('should return a jobId', function (done) {
      const request = supertest(apiUrl)
        .post('/jobs')
        .send({ url: 'http://example.com/' })
      testResponse(request, done)
    })

    it('should work with application/x-www-form-urlencoded', function (done) {
      const request = supertest(apiUrl)
        .post('/jobs')
        .type('form') // Makes supertest send x-www-form-urlencoded
        .send({ url: 'http://example.com/' })
      testResponse(request, done)
    })

  })

}
