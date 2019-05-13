const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '../.env')})

const {google} = require('googleapis')
const base64 = require('base64-url')

const key = require('../secret/doup-staff-6a4c3ef6c6e3.json')

const gmail = google.gmail({version: 'v1'})
const {gmail: {senderAccount, sendAs}} = require('../config')
const logger = require('../config/logger')

// TODO extract this config logic to 'config' or 'client/'
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.labels'],
  senderAccount // Should match the impersonated account
)

async function sendMail({to, subject, body, sendAs = sendAs}) {
  await jwtClient.authorize()

  if (!to || !subject || !body) {
    throw new Error('can\'t send mail unless defining \'to\', \'subject\', and msg \'body\'')
  }

  const from = sendAs ? `${sendAs} <${senderAccount}>` : `${senderAccount}`

  const msg = [
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}\n`,
    `${body}`
  ].join('\n')

  logger.verbose(msg)
  const safe = base64.escape(base64.encode(msg))

  return gmail.users.messages.send({
    auth: jwtClient,
    userId: 'me', // This refers to the service account
    resource: {
      raw: safe
    }
  })
}

module.exports = sendMail
