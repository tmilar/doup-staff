const router = require('express').Router()
const isAuthorized = require('../lib/is-authorized')
const asyncHandler = require('../lib/async-handler')
const logger = require('../config/logger')

router.get('/me', isAuthorized, asyncHandler(async (req, res) => {
  const {username, user: {firstName, lastName, isAdmin, email}} = req

  res
    .status(200)
    .json({username, firstName, lastName, isAdmin, email})
}))

router.post('/token', isAuthorized, asyncHandler(async (req, res) => {
  const {user, body: {pushToken, device: {os, name}}} = req
  const newDevice = {exponentPushToken: pushToken, os, name}

  const areDevicesEqual = (device1, device2) => {
    return device1.os === device2.os
      && device1.name === device2.name
  }

  // check if the device is different from the current one
  const {deviceInfo: currentDevice} = user
  const isDifferentDevice = currentDevice && !areDevicesEqual(currentDevice, newDevice);

  if(isDifferentDevice) {
    const deviceToString = ({os, name}) => JSON.stringify({os, name})
    logger.info(`New device ${deviceToString(newDevice)} is different from the current one: ${deviceToString(currentDevice)}`)

    // move the current device to 'otherDevices'.
    const {otherDevices = []} = user
    const isAlreadyRegistered = otherDevices.find(device => areDevicesEqual(device, currentDevice))
    if(!isAlreadyRegistered) {
      logger.info("Moving current device to 'otherDevices'.")
      user.otherDevices = [...otherDevices, currentDevice]
    }
  }

  if(newDevice.exponentPushToken !== currentDevice.exponentPushToken) {
    logger.info('Updating exponent push token and device info.')
    // override the current deviceInfo
    user.deviceInfo = newDevice
    await user.save()
  }

  res.sendStatus(200)
}))

module.exports = router
