const router = require('express').Router()
const isAuthorized = require('../lib/is-authorized')
const Report = require('../model/report')
const sendReport = require('../service/report')
const asyncHandler = require('../lib/async-handler')

function isValidDateParam(dateStr) {
  const dateParam = new Date(dateStr)
  if (!(dateParam instanceof Date)) {
    return false
  }

  const time5MinutesMillis = 1000 * 60 * 5
  const dateDiffMillis = new Date() - dateParam
  return dateDiffMillis < time5MinutesMillis
}

router.post('/', isAuthorized, asyncHandler(async (req, res) => {
  const {username, user: reportingUser, body: {date}} = req

  if (!isValidDateParam(date)) {
    console.error(`Invalid date param: ${date}`)
    return res
      .status(400)
      .json({status: 400, message: `Fecha inválida: '${date}'`})
  }

  // Create a new report, and send it via mail.
  const {user, date: reportDate} = await Report.create({user: reportingUser, date})

  try {
    await sendReport({user, date: reportDate})
  } catch (error) {
    console.error(`Unexpected error when sending mail report from user '${user.username}'`, error)
  }

  return res
    .status(200)
    .json({date: reportDate, user: {username}})
}))

module.exports = router
// module.exports = googleJwtClient => router
