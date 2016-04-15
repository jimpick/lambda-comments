import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'
import { expect } from 'chai'
import { handler } from './index'

function checkBody (body) {
  expect(body).to.be.a('object')
  const { actionRef, dirName } = body
  expect(actionRef).to.be.a('string')
  expect(dirName).to.be.a('string')
}

export function local () {

  describe('Post new comment to the queue', function () {

    this.timeout(5000)

    it('should return a actionRef', function (done) {
      const event = {
        url: 'http://example.com/blog/1/',
        commentContent: 'My comment',
        authorName: 'Bob Bob',
        authorEmail: 'bob@example.com',
        authorUrl: 'http://bob.example.com/',
        dryRun: true,
        quiet: true
      }
      handler(event, {
        done: (error, body) => {
          checkBody(body)
          const { dirName } = body
          expect(dirName).to.equal('comments/blog/1')
          done()
        },
        fail: error => { console.log(error) }
      })
    })

    it('should fail if there is no url', function (done) {
      const event = {}
      handler(event, {
        done: (error, body) => {
          console.log('Done', error, body)
        },
        fail: error => {
          expect(error).to.be.a('string')
          expect(error).to.equal('[Error: Missing url]')
          done()
        }
      })
    })

    // it('should write a json file to S3')

    // it('should write to DynamoDB')

  })

}

export function remote () {

  describe('Post new comment to the queue', function () {

    this.timeout(5000)

    function testResponse(request, done) {
      request
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(({ body }) => {
          checkBody(body)
        })
        .end(done)
    }

    it('should return an actionRef', function (done) {
      const request = supertest(apiUrl)
        .post('/comments')
        .send({
          url: 'http://example.com/blog/1',
          commentContent: 'My comment',
          authorName: 'Bob Bob',
          authorEmail: 'bob@example.com',
          authorUrl: 'http://bob.example.com/',
          dryRun: true
        })
      testResponse(request, done)
    })

    it('should work with application/x-www-form-urlencoded', function (done) {
      const request = supertest(apiUrl)
        .post('/comments')
        .type('form') // Makes supertest send x-www-form-urlencoded
        .send({
          url: 'http://example.com/blog/1',
          commentContent: 'My comment',
          authorName: 'Bob Bob',
          authorEmail: 'bob@example.com',
          authorUrl: 'http://bob.example.com/',
          dryRun: true
        })
      testResponse(request, done)
    })

    it('should fail if there is no url', function (done) {
      const request = supertest(apiUrl)
        .post('/comments')
        .expect(400)
        .expect({ errorMessage: '[Error: Missing url]' })
        .end(done)
    })

  })

}
