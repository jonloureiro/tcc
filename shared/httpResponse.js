'use strict'

const http = require('http')

exports.UNAUTHORIZED = {
  statusCode: 401,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: http.STATUS_CODES[401] })
}

exports.FORBIDDEN = {
  statusCode: 403,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: http.STATUS_CODES[403] })
}

exports.METHOD_NOT_ALLOWED = {
  statusCode: 405,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: http.STATUS_CODES[405] })
}

exports.SERVICE_UNAVAILABLE = {
  statusCode: 503,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: http.STATUS_CODES[503] })
}
