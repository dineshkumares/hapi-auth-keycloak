const boom = require('boom')
const test = require('ava')
const helpers = require('./_helpers')
const fixtures = require('./fixtures')
const utils = require('../src/utils')

test('get boom error with default message', (t) => {
  const result = utils.error('badRequest')
  t.truthy(result)
  t.deepEqual(result, boom.badRequest(undefined, 'Bearer'))
})

test('get boom error with default message', (t) => {
  const result = utils.error('badRequest', undefined, 'foobar')
  t.truthy(result)
  t.deepEqual(result, boom.badRequest('foobar', 'Bearer'))
})

test('get boom error with error message', (t) => {
  const mockErr = new Error('barfoo')
  const result = utils.error('badRequest', mockErr, 'foobar')
  t.truthy(result)
  t.deepEqual(result, boom.badRequest(mockErr.message, 'Bearer'))
})

test('decorate callback function with `continue`', (t) => {
  const mockFn = function () {}

  utils.fakeReply(mockFn)
  t.truthy(mockFn.continue)
})

test('ignore callback function with exsting `continue`', (t) => {
  const mockFn = function () {}
  mockFn.continue = 'foo'

  utils.fakeReply(mockFn)
  t.truthy(mockFn.continue)
  t.is(mockFn.continue, 'foo')
})

test('throw error if options are empty', (t) => {
  t.throws(() => utils.verify(), Error)
  t.throws(() => utils.verify({}), Error)
})

test('throw error if options are invalid – realmUrl', (t) => {
  const invalids = [
    null,
    undefined,
    NaN,
    '',
    'foobar',
    42,
    true,
    false,
    [],
    new RegExp(),
    {}
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      realmUrl: invalid
    })), Error, helpers.log('realmUrl', invalid))
  })
})

test('throw error if options are invalid – clientId', (t) => {
  const invalids = [
    null,
    undefined,
    NaN,
    '',
    42,
    true,
    false,
    [],
    new RegExp(),
    {}
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      clientId: invalid
    })), Error, helpers.log('clientId', invalid))
  })
})

test('throw error if options are invalid – secret', (t) => {
  const invalids = [
    null,
    NaN,
    '',
    42,
    true,
    false,
    [],
    new RegExp(),
    {}
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      secret: invalid
    })), Error, helpers.log('secret', invalid))
  })
})

test('throw error if options are invalid – publicKey', (t) => {
  const invalids = [
    null,
    NaN,
    '',
    'foobar',
    fixtures.common.baseUrl,
    42,
    true,
    false,
    [],
    new RegExp(),
    {}
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      secret: undefined,
      publicKey: invalid
    })), Error, helpers.log('publicKey', invalid))
  })
})

test('throw error if options are invalid – publicKey/secret conflict', (t) => {
  t.throws(() => utils.verify(helpers.getOptions({
    publicKey: fixtures.common.publicKey
  })), Error, 'publicKey/secret: both defined')
})

test('throw error if options are invalid – cache', (t) => {
  const invalids = [
    null,
    NaN,
    '',
    'foobar',
    fixtures.common.baseUrl,
    42,
    []
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      cache: invalid
    })), Error, helpers.log('cache', invalid))
  })
})

test('throw error if options are invalid – userInfo', (t) => {
  const invalids = [
    null,
    NaN,
    '',
    'foobar',
    fixtures.common.baseUrl,
    42,
    true,
    false,
    new RegExp(),
    {},
    [ null ],
    [ undefined ],
    [ NaN ],
    [ '' ],
    [ 42 ],
    [ true ],
    [ false ],
    [ [] ],
    [ new RegExp() ],
    [ {} ]
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      userInfo: invalid
    })), Error, helpers.log('userInfo', invalid))
  })
})

test('throw error if options are invalid – minTimeBetweenJwksRequests', (t) => {
  const invalids = [
    null,
    NaN,
    '',
    'foobar',
    fixtures.common.baseUrl,
    -42,
    4.2,
    true,
    false,
    new RegExp(),
    {}
  ]

  t.plan(invalids.length)

  invalids.forEach((invalid) => {
    t.throws(() => utils.verify(helpers.getOptions({
      userInfo: invalid
    })), Error, helpers.log('minTimeBetweenJwksRequests', invalid))
  })
})

test('throw no error if options are valid – secret', (t) => {
  const valids = [
    {},
    { secret: undefined },
    { cache: {} },
    { cache: { segment: 'foobar' } },
    { cache: true },
    { cache: false },
    { userInfo: [] },
    { userInfo: ['string'] }
  ]

  t.plan(valids.length)

  valids.forEach((valid) => {
    t.notThrows(
      () => utils.verify(helpers.getOptions(valid)),
      Error, helpers.log('valid.secret', valid))
  })
})

test('throw no error if options are valid – offline', (t) => {
  const valids = [
    { cache: {} },
    { cache: { segment: 'foobar' } },
    { cache: true },
    { cache: false },
    { userInfo: [] },
    { userInfo: ['string'] },
    { minTimeBetweenJwksRequests: 0 },
    { minTimeBetweenJwksRequests: 42 }
  ]

  t.plan(valids.length)

  valids.forEach((valid) => {
    t.notThrows(
      () => utils.verify(helpers.getOptions(Object.assign({
        secret: undefined,
        publicKey: undefined
      }, valid))),
      Error, helpers.log('valid.offline', valid))
  })
})

test('throw no error if options are valid – publicKey/string', (t) => {
  const valids = [
    { cache: {} },
    { cache: { segment: 'foobar' } },
    { cache: true },
    { cache: false },
    { userInfo: [] },
    { userInfo: ['string'] },
    { minTimeBetweenJwksRequests: 0 },
    { minTimeBetweenJwksRequests: 42 }
  ]

  t.plan(valids.length)

  valids.forEach((valid) => {
    t.notThrows(
      () => utils.verify(helpers.getOptions(Object.assign({
        secret: undefined,
        publicKey: fixtures.common.publicKey
      }, valid))),
      Error, helpers.log('valid.publicKey.string', valid))
  })
})

test('throw no error if options are valid – publicKey/Buffer', (t) => {
  const valids = [
    {},
    { cache: {} },
    { cache: { segment: 'foobar' } },
    { cache: true },
    { cache: false },
    { userInfo: [] },
    { userInfo: ['string'] },
    { minTimeBetweenJwksRequests: 0 },
    { minTimeBetweenJwksRequests: 42 }
  ]

  t.plan(valids.length)

  valids.forEach((valid) => {
    t.notThrows(
      () => utils.verify(helpers.getOptions(Object.assign({
        secret: undefined,
        publicKey: fixtures.common.publicKeyBuffer
      }, valid))),
      Error, helpers.log('valid.publicKey.Buffer', valid))
  })
})

test('throw no error if options are valid – publicKey/Buffer/string', (t) => {
  const valids = [
    {},
    { cache: {} },
    { cache: { segment: 'foobar' } },
    { cache: true },
    { cache: false },
    { userInfo: [] },
    { userInfo: ['string'] },
    { minTimeBetweenJwksRequests: 0 },
    { minTimeBetweenJwksRequests: 42 }
  ]

  t.plan(valids.length)

  valids.forEach((valid) => {
    t.notThrows(
      () => utils.verify(helpers.getOptions(Object.assign({
        secret: undefined,
        publicKey: fixtures.common.publicKeyBuffer.toString()
      }, valid))),
      Error, helpers.log('valid.publicKey.Buffer.string', valid))
  })
})
