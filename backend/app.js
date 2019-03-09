const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})

const {Server: server} = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const multer = require('multer')
const multerDriveStorage = require('./lib/drive-storage')
const googleClient = require('./client/google-client')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({
  origin: /http:\/\/localhost(:\d+)?$/
}))

const http = server(app)
const port = process.env.PORT || 3000

async function setup() {
  const jwtClient = await googleClient.authenticate()
  const upload = multer({
    storage: multerDriveStorage({auth: jwtClient})
  })

  const fieldName = 'photo'

  app.post('/upload', upload.single(fieldName), (req, res) => {
    if (!req.file) {
      res.status(500).send({error: 'Could not upload the file. '})
      return
    }

    console.log(`Successfully uploaded file: ${JSON.stringify(req.file)}`)
    res.json(req.file)
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
