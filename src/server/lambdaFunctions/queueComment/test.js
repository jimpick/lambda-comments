import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'
import { apiKey } from '../../../../deploy/state/apiKey.json'
import { expect } from 'chai'
import { handler } from './index'
import jwa from 'jwa'

const hmac = jwa('HS256')

function checkBody (body) {
  expect(body).to.be.a('object')
  const { id } = body
  expect(id).to.be.a('string')
}

export function local () {

  describe('Post new comment to the queue', function () {

    this.timeout(5000)

    it('should return an id', function (done) {
      const payload = {
        permalink: 'http://example.com/blog/1/',
        userAgent: 'testhost/1.0 | node-akismet/0.0.1',
        referrer: 'http://jimpick.com/',
        commentContent: 'My comment',
        authorName: 'Bob Bob',
        authorEmail: 'bob@example.com',
        authorUrl: 'http://bob.example.com/',
      }
      const signature = hmac.sign(JSON.stringify(payload), apiKey)
      const event = {
        fields: {
          payload,
          signature
        },
        sourceIp: '64.46.22.7',
        dryRun: true,
        quiet: true,
        skipSpamCheck: true,
        isTest: true,
      }
      handler(event, null, (error, result) => {
        expect(error).to.be.null
        checkBody(result)
        done()
      })
    })

    it('should fail if there is no data', function (done) {
      const payload = {}
      const signature = hmac.sign(JSON.stringify(payload), apiKey)
      const event = {
        fields: {
          payload,
          signature
        },
        quiet: true,
        skipSpamCheck: true,
        isTest: true,
      }
      handler(event, null, error => {
        expect(error).to.be.a('string')
        expect(error).to.equal(JSON.stringify({
          error: 'ValidationError',
          data: {
            _error: 'Missing user agent',
            commentContent: 'Required'
          }
        }))
        done()
      })
    })

    it('should catch spam', function (done) {
      // FIXME: Use nock to mock HTTP API for akismet
      const payload = {
        permalink: 'http://example.com/blog/1/',
        userAgent: 'testhost/1.0 | node-akismet/0.0.1',
        referrer: 'http://jimpick.com/',
        commentContent: 'My comment',
        authorName: 'viagra-test-123',
        authorEmail: 'bob@example.com',
        authorUrl: 'http://bob.example.com/',
      }
      const signature = hmac.sign(JSON.stringify(payload), apiKey)
      const event = {
        fields: {
          payload,
          signature
        },
        sourceIp: '64.46.22.7',
        // dryRun: true,
        quiet: true,
        isTest: true,
      }
      handler(event, null, (error, result) => {
        expect(error).to.be.a('string')
        expect(error).to.equal(JSON.stringify({
          error: 'SpamError',
          data: {
            _error: 'Our automated filter thinks this comment is spam.'
          }
        }))
        done()
      })
    })

    it('should fail with a bad signature', function (done) {
      const payload = {
        permalink: 'http://example.com/blog/1/',
        userAgent: 'testhost/1.0 | node-akismet/0.0.1',
        referrer: 'http://jimpick.com/',
        commentContent: 'My comment',
        authorName: 'Bob Bob',
        authorEmail: 'bob@example.com',
        authorUrl: 'http://bob.example.com/',
      }
      const signature = hmac.sign(JSON.stringify(payload), 'bad api key')
      const event = {
        fields: {
          payload,
          signature
        },
        sourceIp: '64.46.22.7',
        dryRun: true,
        quiet: true,
        skipSpamCheck: true,
        isTest: true,
      }
      handler(event, null, (error, result) => {
        expect(error).to.be.a('string')
        expect(error).to.equal(JSON.stringify({
          error: 'VerificationError',
          data: {
            _error: 'Checksum verification failed.'
          }
        }))
        done()
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
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(({ body }) => {
          checkBody(body)
        })
        .end(done)
    }

    it('should return an actionRef', function (done) {
      const payload = {
        permalink: 'http://example.com/blog/1',
        userAgent: 'Test Suite',
        referrer: 'http://jimpick.com/',
        commentContent: 'My comment',
        authorName: 'Bob Bob',
        authorEmail: 'bob@example.com',
        authorUrl: 'http://bob.example.com/'
      }
      const signature = hmac.sign(JSON.stringify(payload), apiKey)
      const request = supertest(apiUrl)
        .post('/comments')
        .send({ payload, signature })
      testResponse(request, done)
    })

    it('should fail if there is no data', function (done) {
      const payload = {}
      const signature = hmac.sign(JSON.stringify(payload), apiKey)
      const request = supertest(apiUrl)
        .post('/comments')
        .send({ payload, signature })
        .expect(400)
        .expect({
          errorMessage: JSON.stringify({
            error: 'ValidationError',
            data: {
              _error: 'Missing user agent',
              commentContent: 'Required'
            }
          })
        })
        .end(done)
    })

  })

}
