const nock = require('nock')
const test = require('ava')
const helpers = require('./_helpers')
const fixtures = require('./fixtures')

test.afterEach.always('reset instances and prototypes', () => {
  nock.cleanAll()
})

test.cb.serial('server method – authentication does succeed', (t) => {
  helpers.mock(200, fixtures.content.userData)

  helpers.getServer(undefined, (server) => {
    server.kjwt.validate(`bearer ${fixtures.jwt.userData}`, (err, res) => {
      t.falsy(err)
      t.truthy(res)
      t.truthy(res.credentials)
      t.end()
    })
  })
})

test.cb.serial('server method – authentication does succeed – cache', (t) => {
  helpers.mock(200, fixtures.content.userData)
  helpers.mock(200, fixtures.content.userData)

  helpers.getServer(undefined, (server) => {
    server.kjwt.validate(`bearer ${fixtures.jwt.userData}`, () => {
      server.kjwt.validate(`bearer ${fixtures.jwt.userData}`, (err, res) => {
        t.falsy(err)
        t.truthy(res)
        t.truthy(res.credentials)
        t.end()
      })
    })
  })
})

test.cb.serial('server method – authentication does fail – invalid token', (t) => {
  helpers.mock(200, { active: false })

  helpers.getServer(undefined, (server) => {
    server.kjwt.validate(`bearer ${fixtures.jwt.userData}`, (err, res) => {
      t.falsy(res)
      t.truthy(err)
      t.truthy(err.isBoom)
      t.is(err.output.statusCode, 401)
      t.is(err.output.headers['WWW-Authenticate'], 'Bearer error="Invalid credentials"')
      t.end()
    })
  })
})

test.cb.serial('server method – authentication does fail – invalid header', (t) => {
  helpers.getServer(undefined, (server) => {
    server.kjwt.validate(fixtures.jwt.userData, (err, res) => {
      t.falsy(res)
      t.truthy(err)
      t.truthy(err.isBoom)
      t.is(err.output.statusCode, 401)
      t.is(err.output.headers['WWW-Authenticate'], 'Bearer error="Missing or invalid authorization header"')
      t.end()
    })
  })
})

test.cb.serial('server method – authentication does fail – error', (t) => {
  helpers.mock(400, 'an error', true)

  helpers.getServer(undefined, (server) => {
    server.kjwt.validate(`bearer ${fixtures.jwt.userData}`, (err, res) => {
      t.falsy(res)
      t.truthy(err)
      t.truthy(err.isBoom)
      t.is(err.output.statusCode, 401)
      t.is(err.output.headers['WWW-Authenticate'], 'Bearer error="an error"')
      t.end()
    })
  })
})