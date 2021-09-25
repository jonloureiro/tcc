'use strict'

const jwt = require('jsonwebtoken')

const httpResponse = require('../../../shared/httpResponse')
const config = require('../../../shared/config')
const getUa = require('../../lib/getUa')
const refreshToken = require('../../lib/refreshToken')

exports.handler = async function (event, context) {
  if (context) context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod !== 'POST') return httpResponse.METHOD_NOT_ALLOWED

  console.log(event.headers.cookie)
  if (!event.headers.cookie) return httpResponse.UNAUTHORIZED

  const cookies = event.headers.cookie.split('; ')
  const cookie = cookies.find(s => s.includes('refresh_token'))

  if (!cookie) return httpResponse.UNAUTHORIZED

  const [, oldRefreshToken] = cookie.split('=')

  if (!oldRefreshToken) return httpResponse.UNAUTHORIZED

  try {
    const clientIp = event.headers['client-ip']
    const userAgent = getUa(event.headers['user-agent'])
    const { userId, newRefreshToken, maxAge, username } = await refreshToken(oldRefreshToken, clientIp, userAgent)
    const newAccessToken = jwt.sign({ usr: userId }, config.SECRET, { expiresIn: 300 })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `refresh_token=${newRefreshToken}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=None`,
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': 'http://localhost:40000' // TODO arrumar cors
      },
      body: JSON.stringify({ access_token: newAccessToken, username })
    }
  } catch (error) {
    console.log(error)
    return httpResponse.UNAUTHORIZED
  }
}
