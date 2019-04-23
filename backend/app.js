const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})
const {Server: server} = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const db = require('./config/db')
const googleClient = require('./client/google-client')
const logger = require('./config/logger');
const rTracer = require('cls-rtracer')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({
  origin: /http:\/\/localhost(:\d+)?$/
}))
app.use(cookieParser())

// Setup logs middleware
app.use(logger.requests);
app.use(rTracer.expressMiddleware())

const http = server(app)
const port = process.env.PORT || 3000

async function setup() {
  const [{connection: {name, host, port}}, jwtClient] = await Promise.all([
    db.connect(),
    googleClient.authenticate()
  ])

  logger.info(`db connection open: ${host}:${port}/${name}`)

  const upload = require('./routes/upload')(jwtClient)
  const auth = require('./routes/auth')
  const user = require('./routes/user')
  const report = require('./routes/report')// (jwtClient)
  const lesson = require('./routes/lesson')
  app.use('/upload', upload)
  app.use('/auth', auth)
  app.use('/user', user)
  app.use('/report', report)
  app.use('/lesson', lesson)

  // No route found handler
  app.use((req, res, next) => {
    next({
      message: 'Route not found',
      status: 404,
      level: 'warn',
    });
  });

  // Default Error handler
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(error)
    }

    const {message, status = 500, level = 'error'} = err;
    const log = `${logger.header(req)} ${status} ${message}`;

    logger[level](log);

    res
      .status(status)
      .json({status, message})
  });

}

function start() {
  http.listen(port, () => {
    logger.info(`Listening on port ${port} (${app.get('env')})`)
  })
}

setup()
  .then(start)
  .catch(error => console.error('Unexpected error on app startup:', error))
