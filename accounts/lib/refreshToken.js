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

  if (!oldToken.valid) {
    // TODO: DANGER! INVALIDAR TUDO
  }

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
