const router = require('express').Router()
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
      .status(204)
  }

  res
    .status(200)
    .json(nextLesson)
}))

module.exports = router
