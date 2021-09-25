'use strict'

const config = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
  SECRET: process.env.SECRET || 's3cr3t',
  DOMAIN_SSO: process.env.DOMAIN_SSO || 'accounts.jonloureiro.dev',
  CORS: process.env.CORS || 'http://localhost:8888,http://localhost:40000'
}

Object.freeze(config)

module.exports = config
