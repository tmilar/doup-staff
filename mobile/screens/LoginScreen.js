import React, {Component} from 'react';
import {AsyncStorage, Button, StyleSheet, View} from 'react-native';

export default class LoginScreen extends Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Login" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    //TODO call API to get a good userToken
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
