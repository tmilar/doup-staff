const router = require('express').Router()
const multer = require('multer')
const multerDriveStorage = require('../lib/drive-storage')
const isAuthorized = require('../lib/is-authorized')

module.exports = jwtClient => {
  const upload = multer({
    storage: multerDriveStorage({auth: jwtClient})
  })

  const fieldName = 'photo'

  router.post('/', isAuthorized, upload.single(fieldName), (req, res) => {
    if (!req.file) {
      console.error(`Error when trying to upload image from user ${req.username}`)
      return res
        .status(500)
        .send({error: 'No se pudo subir la imagen. '})
    }

    console.log(`Successfully uploaded file: ${JSON.stringify(req.file)}`)
    res.json(req.file)
  })

  return router
}
