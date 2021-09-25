'use strict'

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const config = require('../../../shared/config')
const createSession = require('../../lib/createSession')
const findUserByUsername = require('../../lib/findUserByUsername')
const getUa = require('../../lib/getUa')
const httpResponse = require('../../../shared/httpResponse')

exports.handler = async function (event, context) {
  if (context) context.callbackWaitsForEmptyEventLoop = false

  if (event.httpMethod !== 'POST') return httpResponse.METHOD_NOT_ALLOWED

  if (!event.body) return httpResponse.UNAUTHORIZED

  const body = JSON.parse(event.body)

  if (!body.username || !body.password) return httpResponse.UNAUTHORIZED

  try {
    const result = await findUserByUsername(body.username)

    if (!result) return httpResponse.UNAUTHORIZED

    const isEqual = await bcrypt.compare(body.password, result.password)

    if (!isEqual) return httpResponse.UNAUTHORIZED

    const clientIp = event.headers['client-ip']
    const userAgent = getUa(event.headers['user-agent'])
    const { refreshToken, maxAge } = await createSession(result._id, clientIp, userAgent)
    const accessToken = jwt.sign({ usr: result._id }, config.SECRET, { expiresIn: 300 })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `refresh_token=${refreshToken}; Max-Age=${maxAge}; Secure; HttpOnly;`
      },
      body: JSON.stringify({ access_token: accessToken })
    }
  } catch (error) {
    console.log(error)
    return httpResponse.SERVICE_UNAVAILABLE
  }
}
