const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const {authSecret} = require('../config')
const isAuthorized = require('../lib/is-authorized')
const asyncHandler = require('../lib/async-handler')
const logger = require('../config/logger')

router.post('/register', asyncHandler(async (req, res) => {
  const {username, email, password} = req.body
  const user = new User({username, email, password})

  try {
    await user.save()
  } catch (error) {
    const logMsg = `Problem registering user ${JSON.stringify({username, email})}. `
    logger.error(logMsg, error)
    error.message = "Ocurrió un problema en el registro. Por favor, intente nuevamente. "
    throw error
  }

  res.json({username, email})
}))

router.post('/login', asyncHandler(async (req, res) => {
  const {username, password} = req.body
  let user
  try {
    user = await User.findOne({username}).select('+password')
  } catch (error) {
    const logMsg = `Problem looking for user ${username} in DB. `
    logger.error(logMsg, error)
    error.message = 'Ocurrió un problema al iniciar sesión. Por favor, intente nuevamente. '
    throw error
  }

  if (!user) {
    logger.info(`Username not found: ${username}. `)
    const error = new Error(`Usuario o contraseña incorrectos`)
    error.status = 401
    throw error
  }

  let isSamePassword
  try {
    isSamePassword = await user.checkPassword(password)
  } catch (error) {
    logger.error('Unexpected error when checking user password. ', error)
    throw new Error(`Ocurrió un problema en el servidor al validar las credenciales. Por favor, intente nuevamente. `)
  }

  if (!isSamePassword) {
    logger.info(`Incorrect password for user ${username}`)
    const error = new Error(`Usuario o contraseña incorrectos`)
    error.status = 401
    throw error
  }

  // Issue token
  const payload = {username}
  const token = jwt.sign(payload, authSecret, {
    expiresIn: '60d'
  })

  logger.info(`User login: ${username}`)

  res.json({token})
}))

router.get('/checkToken', isAuthorized, (req, res) => {
  res.sendStatus(200)
})

module.exports = router
