'use strict'

const getMongoClient = require('./getMongoClient')

module.exports = async function findUserByUsername (userId) {
  const mongoClient = await getMongoClient()
  return mongoClient
    .db('cross-domain-sso')
    .collection('users')
    .findOne({ _id: userId })
}
