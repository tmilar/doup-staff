const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})
const {Server: server} = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const db = require('./config/db')
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
  const {connection: {name}} = await db.connect()
  console.log(`db connection open: ${name}`)

  const jwtClient = await googleClient.authenticate()

  const upload = require('./routes/upload')(jwtClient)
  app.use('/upload', upload)
}

function start() {
  http.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}

setup()
  .then(start)
  .catch(error => console.error('Unexpected error on app startup:', error))
