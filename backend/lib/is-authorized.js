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
    logger.error('Unauthorized: No token provided.')
    const error = new Error('El usuario no esta autorizado')
    error.status = 401
    return next(error)
  }

  let decoded
  try {
    decoded = await jwt.verify(token, authSecret)
  } catch (error) {
    logger.error(`Unauthorized: Invalid token. Msg: ${error.message}`)
    error.message = 'La sesion expiro, por favor vuelva a ingresar'
    error.status = 401
    return next(error)
  }

  // User is logged in
  const {username} = decoded
  req.username = username

  logger.info(`Request from User: '${username}'`)

  let user
  try {
    user = await User.findOne({username})
  } catch (error) {
    logger.error(`Authorization error: problem retrieving user ${username} from DB. `, error)
    error.message = 'La sesion expiro, por favor vuelva a ingresar'
    error.status = 401
    return next(error)
  }

  if (!user) {
    logger.error(`Authorization error: could not find user ${username} in DB.`)
    error.message = 'El nombre de usuario es inválido, por favor vuelva a intentarlo. '
    error.status = 401
    return next(error)
  }

  req.user = user
  next()
}

module.exports = isAuthorized
