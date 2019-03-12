const router = require('express').Router()
const User = require('../model/user')
const isAuthorized = require('../lib/is-authorized')
const Report = require('../model/report')

router.post('/', isAuthorized, async (req, res) => {
  const {username} = req
  const user = await User.findOne({username}, {password: 0})

  const {createdAt} = await Report.create({user})
  res.status(200)
    .json({username, createdAt})
})

module.exports = router
