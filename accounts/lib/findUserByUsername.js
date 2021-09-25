'use strict'

const getMongoClient = require('./getMongoClient')

module.exports = async function findUserByUsername (username) {
  const mongoClient = await getMongoClient()
  return mongoClient
    .db('cross-domain-sso')
    .collection('users')
    .findOne({ username })
}
