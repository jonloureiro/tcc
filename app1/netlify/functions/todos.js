'use strict'

const httpResponse = require('../../../shared/httpResponse')

exports.handler = async function (event, context) {
  if (context) context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod === 'GET') return getMethod(event)

  if (event.httpMethod === 'POST') return postMethod(event)

  return httpResponse.METHOD_NOT_ALLOWED
}

async function getMethod (event) {
  if (!event.headers.authorization) return httpResponse.UNAUTHORIZED

  const [, accessToken] = event.headers.authorization.split(' ')

  if (!accessToken) return httpResponse.UNAUTHORIZED

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' })
  }
}

async function postMethod (event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World2' })
  }
}
