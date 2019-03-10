import React, {Component} from 'react';
import {Platform, StyleSheet, View, StatusBar} from 'react-native';

import UploadScreen from './screens/UploadScreen';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <UploadScreen/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
