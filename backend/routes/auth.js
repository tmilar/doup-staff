const router = require('express').Router()
const User = require('../model/user')

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

module.exports = router
