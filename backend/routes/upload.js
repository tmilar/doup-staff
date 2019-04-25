const router = require('express').Router()
const multer = require('multer')
const multerDriveStorage = require('../lib/drive-storage')
const isAuthorized = require('../lib/is-authorized')
const logger = require('../config/logger')

module.exports = jwtClient => {
  const upload = multer({
    storage: multerDriveStorage({auth: jwtClient})
  })

  const fieldName = 'photo'

  router.post('/', isAuthorized, upload.single(fieldName), (req, res) => {
    if (!req.file) {
      logger.error(`Error when trying to upload image from user ${req.username}`)
      throw new Error('No se pudo subir la imagen. ')
    }

    logger.info(`Successfully uploaded file: ${JSON.stringify(req.file)}`)
    res.json(req.file)
  })

  return router
}
