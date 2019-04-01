const jwt = require('jsonwebtoken')
const {authSecret} = require('../config')
const User = require('../model/user')

async function isAuthorized(req, res, next) {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token

  if (!token || token === 'null') {
    return res
      .status(401)
      .json({status: 401, message: 'Unauthorized: No token provided'})
  }

  let decoded
  try {
    decoded = await jwt.verify(token, authSecret)
  } catch (error) {
    return res.status(401).json({status: 401, message: 'Unauthorized: Invalid token'})
  }

  // User is logged in
  const {username} = decoded
  req.username = username

  let user
  try {
    user = await User.find({username})
  } catch(error) {
    console.error(`Authorization error: problem retrieving user ${username} from DB.`, error)
    return res.status(401).json({status: 401, message: 'Unauthorized: expired token'})
  }
  if(!user) {
    console.error(`Authorization error: could not find user ${username} in DB.`)
    return res.status(401).json({status: 401, message: 'Unauthorized: invalid user'})
  }

  req.user = user
  next()
}

module.exports = isAuthorized
