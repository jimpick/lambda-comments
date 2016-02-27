import assert from 'assert'
import supertest from 'supertest'

export function local () {
  /*
  describe('Array local', function () {
    describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
        assert.equal(-1, [1,2,3].indexOf(5))
        assert.equal(-1, [1,2,3].indexOf(0))
      })
    })
  })
  */
}

export function remote () {
  const url = 'https://61h0ovdpfd.execute-api.us-west-2.amazonaws.com'

  describe('Retrieve jobId', function () {
    it('should return 123', function (done) {
      const request = supertest(url)
      request
        .get('/prod/jobs/123')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ jobId: 123 }, done)
    })
  })
}
