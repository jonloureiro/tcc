'use strict'

const jwt = require('jsonwebtoken')

const httpResponse = require('../../shared/httpResponse')
const config = require('../../shared/config')

exports.handler = async function (event, context) {
  if (context) context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod !== 'GET') return httpResponse.METHOD_NOT_ALLOWED

  if (!event.headers.authorization) return httpResponse.UNAUTHORIZED

  const [, accessToken] = event.headers.authorization.split(' ')

  if (!accessToken) return httpResponse.UNAUTHORIZED

  try {
    const jwtPayload = jwt.verify(accessToken, config.SECRET)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jwtPayload })
    }
  } catch (error) {
    return httpResponse.UNAUTHORIZED
  }
}
