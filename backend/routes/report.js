const router = require('express').Router()
const User = require('../model/user')
const isAuthorized = require('../lib/is-authorized')
const Report = require('../model/report')
const sendReport = require('../service/report')

router.post('/', isAuthorized, async (req, res) => {
  const {username} = req
  const reportingUser = await User.findOne({username})
  const {user, createdAt} = await Report.create({user: reportingUser})

  await sendReport({user, createdAt})

  res.status(200)
    .json({createdAt, user: {username}})
})

module.exports = router
