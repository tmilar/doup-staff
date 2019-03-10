import React, {Component} from 'react'
import {Text, View, StyleSheet, Button, Alert, TextInput, Keyboard, Image, AsyncStorage} from 'react-native'


import {showLoading, hideLoading} from 'react-native-notifyer';
import KeyboardSpacer from 'react-native-keyboard-spacer';

export default class LoginScreen extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    username: '',
    password: '',
    showFooter: true
  };

  _clearForm = () => {
    this.setState({
      username: '',
      password: ''
    });
  }

  _signInAsync = async () => {
    //TODO call API to get a good userToken
    await AsyncStorage.setItem('userToken', 'abc');
  };

  _doLogin = async () => {
    if (this.state.username === '' || this.state.password === '') {
      throw "¡El usuario o la contraseña no pueden estar vacíos!";
    }

    await this._signInAsync()
  }

  _handleLoginButtonPress = async () => {
    Keyboard.dismiss();
    showLoading({text: "Cargando..."});
    try {
      await this._doLogin();
    } catch (e) {
      hideLoading();
      console.log("Login error: ", e);
      Alert.alert(
        'Error',
        e.message || e
      );
      return;
    }
    hideLoading();

    this._clearForm();
    this._goToHome();
  }

  _handleUsernameTextChange = (inputValue) => {
    this.setState({username: inputValue})
  }

  _handlePasswordTextChange = (inputValue) => {
    this.setState({password: inputValue})
  }

  _handleRegisterTextPress = () => {
    Alert.alert(
      '¡Ups!',
      `El registro aún no está habilitado, por favor contacta con la administración.`
    );
  }

  _goToHome = () => {
    this.props.navigation.navigate('App', {username: this.state.username});
  }

  _handleKeyBoardToggle = (visible) => {
    this.setState({showFooter: !visible});
  }

  render() {
    return (
      <View style={[styles.container, styles.scroll, {backgroundColor: '#30282a'}]}>
        <View style={[{flex: 1}]}>

          <View style={styles.header}>
            <Image
              resizeMode="contain"
              source={require('../assets/images/logo-doup_green.png')} />
          </View>

          <View style={styles.loginForm}>
            <TextInput
              value={this.state.username}
              placeholder="Usuario"
              ref="usuario"
              style={[styles.textInput, {color: 'black' }]}
              selectTextOnFocus
              placeholderTextColor="black"
              underlineColorAndroid="transparent"
              autoCapitalize='none'
              returnKeyType='next'
              onSubmitEditing={() => this.refs.password.focus()}
              onChangeText={this._handleUsernameTextChange}
            />
            <TextInput
              value={this.state.password}
              placeholder="Contraseña"
              ref="password"
              style={[styles.textInput, {color: 'black' }]}
              autoCapitalize='none'
              autoCorrect={false}
              placeholderTextColor="black"
              underlineColorAndroid="transparent"
              secureTextEntry
              returnKeyType="go"
              onChangeText={this._handlePasswordTextChange}
              onSubmitEditing={this._handleLoginButtonPress}
            />

            {this.state.showFooter && <View style={{flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
              <View style={styles.actionButtons}>
                <Button
                  title="Login"
                  color="#4b944d"
                  style={styles.Login}
                  onPress={this._handleLoginButtonPress}
                />

                <Text
                  onPress={this._handleRegisterTextPress}
                  style={styles.notRegistered}>
                  No estoy registrado
                </Text>
              </View>
            </View>}

            {/* The next view will animate to match the actual keyboards height */}
            <KeyboardSpacer
              onToggle={this._handleKeyBoardToggle}
            />
          </View>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginForm: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButtons: {
    bottom: 0,
    width: 250
  },
  textInput: {
    width: 200,
    height: 44,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 5
  },
  Login: {
    color: "#4b944d",
    width: 250
  },
  scroll: {
    padding: 30,
  },
  notRegistered: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#f3fffe',
    textDecorationLine: 'underline'
  }
});
