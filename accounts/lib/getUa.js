'use strict'

const parser = require('ua-parser-js')

module.exports = function getUa (userAgent) {
  const ua = parser(userAgent)
  const result = {}

  result.browser = ua.browser && ua.browser.name ? ua.browser.name : 'Unknown'
  result.os = ua.os && ua.os.name ? ua.os.name : 'Unknown'
  result.cpu = ua.cpu && ua.cpu.architecture ? ua.cpu.architecture : 'Unknown'

  return result
}
