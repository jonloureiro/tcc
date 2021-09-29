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

  if (!oldToken.valid) await invalidateSession(oldToken)

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

async function invalidateSession (oldToken) {
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
    .collection('logs')
    .insertOne({
      type: 'Token reuse',
      session: session.value,
      reusedToken: oldToken,
      currentToken: currentToken.value,
      operationTime: new Date()
    })

  throw Error('Refresh token invalid')
}
