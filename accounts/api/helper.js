'use strict'

const httpResponse = require('../../shared/httpResponse')
const config = require('../../shared/config')

exports.handler = async function (event, context) {
  if (context) context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod !== 'GET') return httpResponse.METHOD_NOT_ALLOWED

  const cors = config.CORS.split(',')

  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cors,
        origin: event.headers.origin,
        cookie: event.headers.cookie
      })
    }
  } catch (error) {
    return httpResponse.UNAUTHORIZED
  }
}
