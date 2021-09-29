'use strict'

const crypto = require('crypto')

const getMongoClient = require('./getMongoClient')
const findUserByUserId = require('./findUserByUserId')

module.exports = async function refreshToken (oldRefreshToken, ip, userAgent) {
  if (!oldRefreshToken) throw Error('Without refresh token')

  const mongoClient = await getMongoClient()
  const newRefreshToken = crypto.randomBytes(40).toString('hex')
  const maxAge = 600
  const expiresIn = new Date(Date.now() + maxAge * 1000) // 10min = 600s = 600000ms; 1d = 86400000

  const oldToken = await mongoClient
    .db('cross-domain-sso')
    .collection('tokens')
    .findOne({ refreshToken: oldRefreshToken })

  if (!oldToken) throw Error('Refresh token nonexistent')

  if (!oldToken.valid) await invalidateSessionByTokenInvalid(oldToken)

  const session = await mongoClient
    .db('cross-domain-sso')
    .collection('sessions')
    .findOne({ _id: oldToken.sessionId })

  if (!session) throw Error('Refresh token nonexistent')

  if (!compareUa(session.userAgent, userAgent)) await invalidateSessionByUaNotEqual(oldToken, userAgent)

  const promiseUpdaOldToken = mongoClient
    .db('cross-domain-sso')
    .collection('tokens')
    .findOneAndUpdate({ refreshToken: oldRefreshToken }, {
      $set: { valid: false }
    })

  const promiseInsertNewRefreshToken = mongoClient
    .db('cross-domain-sso')
    .collection('tokens')
    .insertOne({
      sessionId: oldToken.sessionId,
      createByIp: ip,
      refreshToken: newRefreshToken,
      expiresIn,
      valid: true
    })

  const promiseUpdateSession = mongoClient
    .db('cross-domain-sso')
    .collection('sessions')
    .findOneAndUpdate({ _id: oldToken.sessionId }, {
      $set: { expiresIn }
    })

  const [, , updateSession] = await Promise.all([
    promiseUpdaOldToken,
    promiseInsertNewRefreshToken,
    promiseUpdateSession
  ])

  const userId = updateSession.value.createBy
  const { username } = await findUserByUserId(userId)

  return {
    username,
    userId,
    newRefreshToken,
    maxAge
  }
}

async function invalidateSessionByTokenInvalid (oldToken) {
  const mongoClient = await getMongoClient()

  const promiseDeleteSession = mongoClient
    .db('cross-domain-sso')
    .collection('sessions')
    .findOneAndDelete({ _id: oldToken.sessionId })

  const promiseCurrentTokenValid = mongoClient
    .db('cross-domain-sso')
    .collection('tokens')
    .findOneAndUpdate({ sessionId: oldToken.sessionId, valid: true }, {
      $set: { valid: false }
    })

  const [session, currentToken] = await Promise.all([
    promiseDeleteSession,
    promiseCurrentTokenValid
  ])

  await mongoClient
    .db('cross-domain-sso')
    .collection('logs-token-reuse')
    .insertOne({
      session: session.value,
      reusedToken: oldToken,
      currentToken: currentToken.value,
      operationTime: new Date()
    })

  throw Error('Refresh token invalid')
}

async function invalidateSessionByUaNotEqual (oldToken, currentUserAgent) {
  const mongoClient = await getMongoClient()

  const promiseDeleteSession = mongoClient
    .db('cross-domain-sso')
    .collection('sessions')
    .findOneAndDelete({ _id: oldToken.sessionId })

  const promiseCurrentTokenValid = mongoClient
    .db('cross-domain-sso')
    .collection('tokens')
    .findOneAndUpdate({ sessionId: oldToken.sessionId, valid: true }, {
      $set: { valid: false }
    })

  const [session, currentToken] = await Promise.all([
    promiseDeleteSession,
    promiseCurrentTokenValid
  ])

  await mongoClient
    .db('cross-domain-sso')
    .collection('logs-ua-not-equal')
    .insertOne({
      session: session.value,
      token: currentToken.value,
      currentUserAgent,
      operationTime: new Date()
    })

  throw Error('Refresh token invalid')
}

function compareUa (ua1, ua2) {
  return ua1.browser === ua2.browser && ua1.os === ua2.os && ua1.cpu === ua2.cpu
}
