const router = require('express').Router()
const isAuthorized = require('../lib/is-authorized')
const asyncHandler = require('../lib/async-handler')

router.get('/me', isAuthorized, asyncHandler(async (req, res) => {
  const {username, user: {firstName, lastName, isAdmin, email}} = req

  res
    .status(200)
    .json({username, firstName, lastName, isAdmin, email})
}))

module.exports = router
