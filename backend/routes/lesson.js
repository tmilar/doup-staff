const router = require('express').Router()
const moment = require('moment-timezone')
const isAuthorized = require('../lib/is-authorized')
const asyncHandler = require('../lib/async-handler')
const Lesson = require('../model/lesson')
const logger = require('../config/logger')

/**
 * Retrieve user next lesson.
 */
router.get('/next', isAuthorized, asyncHandler(async (req, res) => {
  const {user: {_id}} = req
  const nextLesson = await Lesson.findNextForUser(_id)

  if (!nextLesson) {
    logger.info('No next lesson found.')
    return res
      .sendStatus(204)
  }

  res
    .status(200)
    .json(nextLesson)
}))

async function findInstructorLessonById(lessonId, {_id, username}) {
  const lesson = await Lesson.findById(lessonId)

  if (!lesson) {
    logger.error(`Lesson id ${lessonId} not found. `)
    const error = new Error('La clase seleccionada no existe.')
    error.status = 404
    throw error
  }
  // Lesson found

  if (!lesson.instructor.equals(_id)) {
    logger.error(`User id ${_id} '${username}' can't start a lesson from other instructor. `)
    const error = new Error('No estás autorizado para modificar esta clase.')
    error.status = 403
    throw error
  }

  // Lesson belongs to the user
  return lesson
}

router.post('/:id/start', isAuthorized, asyncHandler(async (req, res) => {
  const {user, params: {id: lessonId}} = req
  const now = moment().toDate()
  const lesson = await findInstructorLessonById(lessonId, user)

  if (lesson.actualStartDate) {
    // Error: lesson has already been started
    logger.info(`Lesson ${lesson._id} has already been started, at ${lesson.actualStartDate}.`)
    const error = new Error(`La clase seleccionada ya ha sido iniciada ${moment(lesson.actualStartDate).fromNow()}.`)
    error.status = 400
    throw error
  }

  // Actually start lesson
  await lesson.saveStartDate(now)

  res.status(200).json(lesson)
}))

router.post('/:id/end', isAuthorized, asyncHandler(async (req, res) => {
  const {user, params: {id: lessonId}} = req
  const now = moment().toDate()
  const lesson = await findInstructorLessonById(lessonId, user)

  if (lesson.actualEndDate) {
    // Error: lesson has already been finished
    logger.info(`Lesson ${lesson._id} has already been finished, at ${lesson.actualEndDate}.`)
    const error = new Error(`La clase seleccionada ya ha sido finalizada ${moment(lesson.actualEndDate).fromNow()}.`)
    error.status = 400
    throw error
  }

  // Actually end lesson
  await lesson.saveEndDate(now)

  res.status(200).json(lesson)
}))

module.exports = router
