const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})

const {Server: server} = require('http')
const express = require('express')
const multer = require('multer')
const multerDriveStorage = require('./lib/drive-storage')
const googleClient = require('./client/google-client')

const app = express()
const http = server(app)
const port = process.env.PORT || 3000

async function setup() {
  const jwtClient = await googleClient.authenticate()
  const upload = multer({
    storage: multerDriveStorage({auth: jwtClient})
  })

  const fieldName = 'my-picture'

  app.post('/upload', upload.single(fieldName), (req, res) => {
    res.send('Successfully uploaded file: \n' + JSON.stringify(req.file))
  })
}

function start() {
  http.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}

setup()
  .then(start)
  .catch(error => console.error('Unexpected error on app startup:', error))
