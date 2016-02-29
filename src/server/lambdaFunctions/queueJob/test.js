import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'
import { expect } from 'chai'
import { handler } from './index'

function checkBody (body) {
  expect(body).to.be.a('object')
  const { jobRef } = body
  expect(jobRef).to.be.a('string')
}

export function local () {

  describe('Post new job and get jobRef', function () {

    it('should return a jobRef', function (done) {
      const event = {
        url: 'http://example.com/'
      }
      handler(event, {
        done: (error, body) => {
          checkBody(body)
          done()
        }
      })
    })

    it('should fail if there is no url', function (done) {
      const event = {}
      handler(event, {
        fail: (error, body) => {
          expect(error).to.be.a('string')
          expect(error).to.equal('[Error: Missing url]')
          done()
        }
      })
    })

  })

}

export function remote () {

  describe('Post new job and get jobRef', function () {

    function testResponse(request, done) {
      request
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(({ body }) => {
          checkBody(body)
        })
        .end(done)
    }

    it('should return a jobRef', function (done) {
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

    it('should fail if there is no url', function (done) {
      const request = supertest(apiUrl)
        .post('/jobs')
        .expect(400)
        .expect({ errorMessage: '[Error: Missing url]' })
        .end(done)
    })

  })

}
