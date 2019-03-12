const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const {authSecret} = require('../config')
const isAuthorized = require('../lib/is-authorized')

router.post('/register', async (req, res) => {
  const {username, email, password} = req.body
  const user = new User({username, email, password})

  try {
    await user.save()
  } catch (error) {
    console.error(`Problem registering user ${JSON.stringify({username, email})}`, error)
    return res
      .status(500)
      .json({status: 500, message: error.message || error || ''})
  }

  return res
    .status(200)
    .json({username, email})
})

router.post('/login', async (req, res) => {
  const {username, password} = req.body
  let user
  try {
    user = await User.findOne({username}).select("+password")
  } catch (error) {
    console.error(`Problem looking for user ${username} in DB.`, error)
    return res
      .status(500)
      .json({
        error: 'Internal error please try again'
      })
  }

  if (!user) {
    console.log(`Username not found: ${username}`)
    return res
      .status(401)
      .json({
        error: 'Usuario o contraseña incorrectos.'
      })
  }

  let same
  try {
    same = await user.checkPassword(password)
  } catch (error) {
    console.error(error)
    return res.status(500)
      .json({
        error: 'Internal error please try again'
      })
  }

  if (!same) {
    console.log(`Incorrect password for user ${username}`)
    return res.status(401)
      .json({
        error: 'Usuario o contraseña incorrectos'
      })
  }

  // Issue token
  const payload = {username}
  const token = jwt.sign(payload, authSecret, {
    expiresIn: '60d'
  })
  res
    .status(200)
    .json({token})
})

router.get('/checkToken', isAuthorized, (req, res) => {
  res.sendStatus(200)
})

module.exports = router
