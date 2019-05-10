import {AsyncStorage, Platform} from 'react-native';
import {Constants, Notifications, Permissions} from 'expo';
import client from './RequestClient'

const PUSH_ENDPOINT = `/user/token`;

class PushNotificationsService {
  /**
   * Register current device info + exponent token,
   * to be able to receive push notifications from the server.
   *
   * @returns {Promise<void>} - async promise
   */
  registerDevice = async () => {
    try {
      await this._registerDeviceRequest()
    } catch (error) {
      error.message = 'Error al registrarse para recibir notificaciones: '
        + `\n${error.message} ${error.status ? `(${error.status})` : ''}`
        + '\nPor favor, intenta nuevamente; y si el problema persiste, ¡avísanos!';
      throw error
    }

    await AsyncStorage.setItem('isRegisteredForPushNotifications', 'true')
  }

  /**
   * Check if device is correctly registered.
   *
   * @returns {Promise<boolean>} - true if registered
   */
  isDeviceRegistered = async () => {
    const isRegistered = await AsyncStorage.getItem('isRegisteredForPushNotifications');
    return isRegistered === 'true'
  }

  /**
   * Check/request Notifications permission,
   * and send request to server for registering device for push notifications.
   *
   * @returns {Promise<*>} - register request promise
   * @private
   */
  _registerDeviceRequest = async () => {
    const hasPermission = await this._checkNotificationPermission();

    // Stop here if the user did not grant permissions
    if (!hasPermission) {
      throw new Error('Se requieren permisos para poder recibir notificaciones')
    }

    // Get the token that uniquely identifies this device + expo installation
    let pushToken = await Notifications.getExpoPushTokenAsync();

    const {OS: os} = Platform
    const {deviceName: name, installationId} = Constants

    // POST the token to the backend server, from it will be retrieved to send push notifications.
    return client.sendRequest(PUSH_ENDPOINT, {
      method: 'POST',
      body: {
        pushToken,
        device: {
          os,
          name
        }
      }
    })
  }

  /**
   * Check if notifications permissions are granted, or try to request them otherwise.
   *
   * @returns {Promise<boolean>} true if granted
   * @private
   */
  _checkNotificationPermission = async () => {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    return finalStatus === 'granted';
  }
}

export default new PushNotificationsService()
