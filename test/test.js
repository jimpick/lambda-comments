import assert from 'assert'
import 'babel-polyfill'

function local () {
  describe('local', function () {
    describe('Array local', function () {
      describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
          assert.equal(-1, [1,2,3].indexOf(5))
          assert.equal(-1, [1,2,3].indexOf(0))
        })
      })
    })
  })
}

function remote () {
  describe('remote', function () {
    describe('Array remote', function () {
      describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
          assert.equal(-1, [1,2,3].indexOf(5))
          assert.equal(-1, [1,2,3].indexOf(0))
        })
      })
    })
  })
}

local()
remote()


