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
  const time5MinutesMillis = 1000*60*5
  const dateDiffMillis = new Date() - dateParam
  return dateDiffMillis < time5MinutesMillis
}

router.post('/', isAuthorized, async (req, res) => {
  const {username} = req
  const {date} = req.body
  if(!isValidDateParam(date)) {
    return res.status(400)
      .json({status: 400, message: `El cliente ingreso una fecha invalida: '${date}'`})
  }

  const reportingUser = await User.findOne({username})
  if(!reportingUser) {
    return res.status(400)
      .json({status: 400, message: `Usuario invalido: ${username}, por favor inicie sesion nuevamente.`})
  }

  // create a new report, and send it via mail.
  const {user, date: reportDate} = await Report.create({user: reportingUser, date})

  await sendReport({user, date: reportDate})

  res.status(200)
    .json({date: reportDate, user: {username}})
})

module.exports = router
