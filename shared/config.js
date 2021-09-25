'use strict'

const config = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
  SECRET: process.env.SECRET || 's3cr3t',
  CLIENT: process.env.CLIENT || 'app1-tcc-jonloureiro.netlify.app',
  DOMAIN_SSO: process.env.DOMAIN_SSO || 'accounts-tcc-jonloureiro-888075.netlify.live'
}

Object.freeze(config)

module.exports = config
