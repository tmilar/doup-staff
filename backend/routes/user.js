const router = require('express').Router()
const User = require('../model/user')
const isAuthorized = require('../lib/is-authorized')

router.get('/me', isAuthorized, async (req, res) => {
  const {username} = req
  const {firstName, lastName, isAdmin, email} = await User.findOne({username})

  res.status(200)
    .json({username, firstName, lastName, isAdmin, email})
})

module.exports = router
