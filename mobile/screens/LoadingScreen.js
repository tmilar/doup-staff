import React from 'react';
import {ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, View} from 'react-native';
import LessonService from "../service/LessonService";

export default class LoadingScreen extends React.Component {

  async componentDidMount() {
    const {navigation} = this.props

    if(!await this._checkLogin()) {
      // switch to the Auth screen and unmount this loading screen away.
      console.log("[LoadingScreen] No login, navigating to 'Auth'.")
      navigation.navigate('Auth')
      return
    }

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
