const rTracer = require('cls-rtracer')
const {createLogger, format: {combine, timestamp, printf}, transports} = require('winston');

const morgan = require('morgan')
const stripFinalNewline = require('strip-final-newline');

// a custom format that outputs request id
const rTracerFormat = printf((info) => {
  const padding = info.padding && info.padding[info.level] || '';
  const header = `${info.level}:${padding} ${info.timestamp}`

  const rid = rTracer.id()
  return rid
    ? `${header} [request-id:${rid}]: ${info.message}`
    : `${header}: ${info.message}`
})

// Setup logger
const logger = createLogger({
  format: combine(
    timestamp(),
    rTracerFormat
  ),
  transports: [new transports.Console()],
});

const requestFormat = ':remote-addr ":method :url" :status';
const requests = morgan(requestFormat, {
  stream: {
    write: (message) => {
      // Remove all line breaks
      const log = stripFinalNewline(message);
      return logger.info(log);
    },
  },
});

// Attach morgan requests format to logger object
logger.requests = requests;

// Format as request logger and attach to logger object
logger.header = (req) => {
  return `${req.ip} "${req.method} ${req.originalUrl}"`;
};

module.exports = logger;
