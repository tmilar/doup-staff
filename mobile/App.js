import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Uploader from './components/Uploader'

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Uploader/>
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
