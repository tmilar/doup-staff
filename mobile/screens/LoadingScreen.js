import React from 'react';
import {ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, View,} from 'react-native';
import LessonService from "../service/LessonService";

export default class LoadingScreen extends React.Component {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    await this._checkLogin();
    await this._checkCurrentLesson()
  };

  /**
   * If no login, navigate to Auth screen.
   *
   * @returns {Promise<void>}
   * @private
   */
  _checkLogin = async () => {
    const isLoggedIn = !!(await AsyncStorage.getItem('userToken'));

    if (!isLoggedIn) {
      // switch to the Auth screen and unmount this loading screen away.
      this.props.navigation.navigate('Auth')
    }
  }

  /**
   * Check current lesson, then navigate to proper screen.
   *
   * @returns {Promise<void>}
   * @private
   */
  _checkCurrentLesson = async () => {
    const {navigation} = this.props
    console.log("[LoadingScreen] Fetching next lesson...")
    const lesson = await LessonService.retrieveNextLesson()

    if (!lesson) {
      console.log("[LoadingScreen] No next lesson, navigating to 'App'")
      navigation.navigate('App')
      return
    }

    if (!lesson.actualStartDate) {
      console.log("[LoadingScreen] Next lesson has not been started yet, navigating to 'UpcomingLesson'")
      navigation.navigate('UpcomingLesson')
    } else {
      console.log("[LoadingScreen] Next lesson has already been started, navigating to 'CurrentLesson'")
      navigation.navigate('CurrentLesson')
    }
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
