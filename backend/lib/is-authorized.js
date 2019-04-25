const jwt = require('jsonwebtoken')
const {authSecret} = require('../config')
const User = require('../model/user')
const logger = require('../config/logger')

async function isAuthorized(req, res, next) {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token

  if (!token || token === 'null') {
    logger.info('Unauthorized: No token provided.')
    return res
      .status(401)
      .json({status: 401, message: 'El usuario no esta autorizado'})
  }

  let decoded
  try {
    decoded = await jwt.verify(token, authSecret)
  } catch (error) {
    logger.error('Unauthorized: Invalid token.')
    return res
      .status(401)
      .json({status: 401, message: 'La sesion expiro, por favor vuelva a ingresar'})
  }

  // User is logged in
  const {username} = decoded
  req.username = username

  let user
  try {
    user = await User.findOne({username})
  } catch (error) {
    logger.error(`Authorization error: problem retrieving user ${username} from DB. `, error)
    return res
      .status(401)
      .json({status: 401, message: 'La sesion expiro, por favor vuelva a ingresar'})
  }

  if (!user) {
    logger.error(`Authorization error: could not find user ${username} in DB.`)
    return res
      .status(401)
      .json({status: 401, message: 'El nombre de usuario es inválido, por favor vuelva a ingresar.'})
  }

  req.user = user
  next()
}

module.exports = isAuthorized
