import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

export default class LoadingScreen extends React.Component {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const isLoggedIn = !!(await AsyncStorage.getItem('userToken'));

    // if not logged in, switch to the Auth screen and unmount this loading screen away.
    // otherwise navigate to the App
    const nextScreen = isLoggedIn ? 'App' : 'Auth'
    // TODO fetch the nextLesson + currentStatus data => then go to proper screem
    this.props.navigation.navigate(nextScreen);
  };

  // Render any loading content that you like here
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
