const test = require('ava')
const helpers = require('./_helpers')
const cache = require('../src/cache')

test.cb.serial('set and get value', (t) => {
  helpers.getServer(false, (server) => {
    const store = cache.init(server, { segment: 'foo' })
    cache.set(store, 'bar', 42, 10000)

    cache.get(store, 'bar', (err, res) => {
      t.falsy(err)
      t.is(res, 42)
      t.end()
    })
  })
})

test.cb.serial('set and get value – no cache', (t) => {
  helpers.getServer(false, (server) => {
    const store = cache.init(server, false)
    cache.set(store, 'bar', 42, 10000)

    cache.get(store, 'bar', (err, res) => {
      t.falsy(err)
      t.is(res, false)
      t.end()
    })
  })
})

test.cb.serial('set and get value – expired', (t) => {
  helpers.getServer(false, (server) => {
    const store = cache.init(server, { segment: 'foo' })
    cache.set(store, 'bar', 42, 100)

    setTimeout(() => {
      cache.get(store, 'bar', (err, res) => {
        t.falsy(err)
        t.is(res, null)
        t.end()
      })
    }, 200)
  })
})
