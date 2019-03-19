const router = require('express').Router()
const User = require('../model/user')
const isAuthorized = require('../lib/is-authorized')
const Report = require('../model/report')
const sendReport = require('../service/report')

function isValidDateParam(dateStr) {
  const dateParam = new Date(dateStr)
  if(!dateParam instanceof Date) {
    return false
  }
  const time3MinutesMillis = 1000*60*3
  const dateDiffMillis = new Date() - dateParam
  return dateDiffMillis > time3MinutesMillis
}

router.post('/', isAuthorized, async (req, res) => {
  const {username} = req
  const {date} = req.body
  if(!isValidDateParam(date)) {
    return res.status(401)
      .json({status: 401, error: `param 'date' is invalid: '${date}'`})
  }

  const reportingUser = await User.findOne({username})
  const {user, date: reportDate} = await Report.create({user: reportingUser, date})

  await sendReport({user, date: reportDate})

  res.status(200)
    .json({date: reportDate, user: {username}})
})

module.exports = router
