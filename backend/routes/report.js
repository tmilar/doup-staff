const router = require('express').Router()
const moment = require('moment-timezone')
const isAuthorized = require('../lib/is-authorized')
const Report = require('../model/report')
const Lesson = require('../model/lesson')
const sendReport = require('../service/report')
const asyncHandler = require('../lib/async-handler')
const logger = require('../config/logger')

moment.locale('es')
moment.tz.setDefault('America/Argentina/Buenos_Aires')

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
  const {username, user: reportingUser, body: {date: reportDate}} = req

  if (!isValidDateParam(reportDate)) {
    logger.error(`Invalid date param: ${reportDate}`)
    return res
      .status(400)
      .json({status: 400, message: `Fecha inválida: '${reportDate}'`})
  }

  const currentLesson = await Lesson.findNextForUser(reportingUser._id)
  const startOfDay = moment(reportDate).startOf('day')
  const previousLessons = await Lesson.find()
    .and([
      {site: currentLesson.site},
      {startDate: {$gt: startOfDay}},
      {startDate: {$lt: reportDate}},
      {_id: {$ne: currentLesson._id}}
    ])
    .populate('instructor')
    .sort({endDate: -1})

  // Create a new report, and send it via mail.
  const report = await Report.create({user: reportingUser, date: reportDate, previousLessons, currentLesson})

  try {
    await sendReport(report)
  } catch (error) {
    logger.error(`Unexpected error when sending mail report from user '${reportingUser.username}'`, error)
  }

  return res
    .status(200)
    .json({date: reportDate, user: {username}})
}))

module.exports = router
// module.exports = googleJwtClient => router
