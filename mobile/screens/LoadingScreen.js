import React from 'react';
import {ActivityIndicator, Alert, AsyncStorage, StatusBar, StyleSheet, View} from 'react-native';
import LessonService from "../service/LessonService";
import PushNotificationsService from "../service/PushNotificationsService";

export default class LoadingScreen extends React.Component {

  async componentDidMount() {
    const {navigation} = this.props

    if (!await this._checkLogin()) {
      // switch to the Auth screen and unmount this loading screen away.
      console.log("[LoadingScreen] No login, navigating to 'Auth'.")
      navigation.navigate('Auth')
      return
    }
    console.log("[LoadingScreen] User is logged in.")

    if (!await this._checkRegisterForPushNotifications()) {
      // switch to the Auth screen and unmount this loading screen away.
      console.log("[LoadingScreen] Register for push notifications failed, navigating to 'Auth'.")
      await AsyncStorage.clear()
      navigation.navigate('Auth')
      return
    }
    console.log("[LoadingScreen] Device is registered for push notifications.")

    const lessonScreen = await this._checkCurrentLesson()
    navigation.navigate(lessonScreen)
  };

  /**
   * Check login.
   *
   * @returns {Promise<boolean>}
   * @private
   */
  _checkLogin = async () => {
    return !!(await AsyncStorage.getItem('userToken'))
  }

  /**
   * Check if device/installation is registered for push notifications for the user.
   * If not, try to register.
   *
   * @returns {Promise<boolean>}
   * @private
   */
  _checkRegisterForPushNotifications = async () => {
    if(await PushNotificationsService.isDeviceRegistered()) {
      return true
    }

    try {
      await PushNotificationsService.registerDevice()
    } catch (error) {
      Alert.alert("Ups...", error.message)
      return false
    }

    console.log("[LoadingScreen] Device now registered for push notifications.")
    return true
  }

  /**
   * Check current lesson, then navigate to proper screen.
   *
   * @returns {Promise<string>}
   * @private
   */
  _checkCurrentLesson = async () => {
    console.log("[LoadingScreen] Fetching next lesson...")
    const lesson = await LessonService.retrieveNextLesson()

    if (!lesson) {
      console.log("[LoadingScreen] No next lesson, navigating to 'App'")
      return 'App'
    }

    const isUpcoming = LessonService.isUpcoming(lesson) // still not started, and is startable
    if(isUpcoming) {
      console.log("[LoadingScreen] Next lesson has not been started yet, navigating to 'UpcomingLesson'")
      return 'UpcomingLesson'
    }

    const isCurrent = LessonService.isCurrent(lesson) // started, but still not finished.
    if(isCurrent) {
      console.log("[LoadingScreen] Lesson has already been started, and not yet finished, navigating to 'CurrentLesson'")
      return 'CurrentLesson'
    }

    console.error("[LoadingScreen] lesson is not upcoming and not current... navigating to 'App'")
    return 'App'
  }

  // Render loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator/>
        <StatusBar barStyle="default"/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
