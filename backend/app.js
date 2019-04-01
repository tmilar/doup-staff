const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})
const {Server: server} = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const db = require('./config/db')
const googleClient = require('./client/google-client')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({
  origin: /http:\/\/localhost(:\d+)?$/
}))
app.use(cookieParser())

if (app.get('env') === 'production') {
  app.use(logger('combined'))
} else {
  app.use(logger('dev'))
}

app.use(function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const status = error.status || 500
  const message = error.message || error
  res
    .status(status)
    .json({status, message})
})

const http = server(app)
const port = process.env.PORT || 3000

async function setup() {
  const [{connection: {name}}, jwtClient] = await Promise.all([
    db.connect(),
    googleClient.authenticate()
  ])

  console.log(`db connection open: ${name}`)

  const upload = require('./routes/upload')(jwtClient)
  const auth = require('./routes/auth')
  const user = require('./routes/user')
  const report = require('./routes/report')//(jwtClient)
  app.use('/upload', upload)
  app.use('/auth', auth)
  app.use('/user', user)
  app.use('/report', report)
}

function start() {
  http.listen(port, () => {
    console.log(`Listening on port ${port} (${app.get('env')})`)
  })
}

setup()
  .then(start)
  .catch(error => console.error('Unexpected error on app startup:', error))
