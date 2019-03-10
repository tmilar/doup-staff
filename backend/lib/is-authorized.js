const jwt = require('jsonwebtoken')
const {authSecret} = require('../config')

async function isAuthorized(req, res, next) {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token
  if (!token) {
    return res
      .status(401)
      .json({status: 401, message: 'Unauthorized: No token provided'})
  }

  let decoded
  try {
    decoded = await jwt.verify(token, authSecret)
  } catch (error) {
    res.status(401).json({status: 401, message: 'Unauthorized: Invalid token'})
  }

  req.username = decoded.username
  next()
}

module.exports = isAuthorized
