'use strict'

const httpResponse = require('../../shared/httpResponse')
const config = require('../../shared/config')
const invalidateSession = require('../lib/invalidateSession')

const RESPONSE_DEFAULT = origin => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Set-Cookie': 'refresh_token=; Max-Age=1; Secure; HttpOnly;',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': origin
  }
})

exports.handler = async function (event, context) {
  if (context) context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod !== 'POST') return httpResponse.METHOD_NOT_ALLOWED

  const cors = config.CORS.split(',')
  if (!cors.includes(event.headers.origin)) return httpResponse.UNAUTHORIZED

  if (!event.headers.cookie) return RESPONSE_DEFAULT(event.headers.origin)

  const [, refreshToken] = event.headers.cookie.split('=')

  if (!refreshToken) return RESPONSE_DEFAULT(event.headers.origin)

  try {
    await invalidateSession(refreshToken)
    return RESPONSE_DEFAULT(event.headers.origin)
  } catch (error) {
    return {
      ...RESPONSE_DEFAULT(event.headers.origin),
      body: JSON.stringify({ error: error.message })
    }
  }
}
