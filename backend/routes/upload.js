const router = require('express').Router()
const multer = require('multer')
const multerDriveStorage = require('../lib/drive-storage')

module.exports = (jwtClient) => {
  const upload = multer({
    storage: multerDriveStorage({auth: jwtClient})
  })

  const fieldName = 'photo'

  router.post('/', upload.single(fieldName), (req, res) => {
    if (!req.file) {
      res.status(500).send({error: 'Could not upload the file. '})
      return
    }

    console.log(`Successfully uploaded file: ${JSON.stringify(req.file)}`)
    res.json(req.file)
  })

  return router
}
