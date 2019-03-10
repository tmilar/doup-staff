import React from 'react';
import {AsyncStorage, Button, StyleSheet, View} from 'react-native';

import {Icon} from 'expo';

export default class HomeScreen extends React.Component {

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  _goToUploadScreen = () => {
    this.props.navigation.replace('Upload');
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Comenzar" onPress={this._goToUploadScreen} />
        <Button title="Salir" onPress={() => this._signOutAsync()} />
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
