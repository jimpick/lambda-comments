import assert from 'assert'
import supertest from 'supertest'
import { apiUrl } from '../../lib/cloudFormation'

export function local () {
}

export function remote () {

  describe('Retrieve jobId', function () {
    it('should return 123', function (done) {
      supertest(apiUrl)
        .get('/jobs/123')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ jobId: 123 }, done)
    })
  })
}
