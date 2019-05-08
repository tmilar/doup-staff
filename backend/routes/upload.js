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
    const {file, username} = req
    if (!file) {
      logger.error(`Error when trying to upload image from user ${username}`)
      throw new Error('No se pudo subir la imagen. ')
    }

    logger.info(`Successfully uploaded file '${file.googleId}': ${file.uploadFilename}`)
    res.sendStatus(200)
  })

  return router
}
