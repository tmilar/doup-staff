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
  const newDeviceInfo = {exponentPushToken: pushToken, os, name}

  // Check if the device is different from the current one
  const areDevicesEqual = (device1, device2) => {
    return device1.os === device2.os &&
      device1.name === device2.name
  }

  const {deviceInfo: currentDevice} = user
  const hasCurrentDevice = currentDevice.os && currentDevice.name
  const isDifferentDevice = hasCurrentDevice  && !areDevicesEqual(currentDevice, newDeviceInfo)

  if (isDifferentDevice) {
    const deviceToString = ({os, name}) => JSON.stringify({os, name})
    logger.info(`New device ${deviceToString(newDeviceInfo)} is different from the current one: ${deviceToString(currentDevice)}`)

    // Move the current device to 'otherDevices'.
    const {otherDevices = []} = user
    const isAlreadyRegistered = otherDevices.find(device => areDevicesEqual(device, currentDevice))
    if (!isAlreadyRegistered) {
      logger.info('Moving current device to \'otherDevices\'.')
      user.otherDevices = [...otherDevices, currentDevice]
    }
  }

  if (newDeviceInfo.exponentPushToken !== currentDevice.exponentPushToken) {
    logger.info('Updating exponent push token and device info.')
    // Override the current deviceInfo
    user.deviceInfo = newDeviceInfo
    await user.save()
  } else {
    logger.info('Exponent push token is already registered.')
  }

  res.sendStatus(200)
}))

module.exports = router
