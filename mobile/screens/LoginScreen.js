import React, {Component} from 'react'
import {Text, View, StyleSheet, Button, Alert, TextInput, Keyboard, Image, AsyncStorage} from 'react-native'

import client from '../service/RequestClient'

import {showLoading, hideLoading} from 'react-native-notifyer';
import KeyboardSpacer from 'react-native-keyboard-spacer';

const pkg = require('../package.json');

export default class LoginScreen extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    username: '',
    password: '',
    keyboardVisible: false
  };

  _clearForm = () => {
    this.setState({
      username: '',
      password: ''
    });
  }

  _loginRequest = async () => {
    const resource = '/auth/login'
    const {username, password} = this.state

    return client.sendRequest(resource, {
      method: 'POST',
      body: {
        username,
        password
      }
    })
  }

  _profileRequest = async () => {
    const resource = '/user/me'
    return client.sendRequest(resource)
  }

  _signInAsync = async () => {
    try {
      const {token} = await this._loginRequest()
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Usuario o contraseña inválidos, por favor intente nuevamente.')
      }
      throw error
    }
  }

  _fetchUserProfile = async () => {
    const profile = await this._profileRequest()
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
  }

  _doLogin = async () => {
    if (this.state.username === '' || this.state.password === '') {
      throw '¡El usuario o la contraseña no pueden estar vacíos!';
    }

    await this._signInAsync()
    await this._fetchUserProfile()
  }

  _handleLoginButtonPress = async () => {
    Keyboard.dismiss();
    showLoading({text: 'Cargando...'});
    try {
      await this._doLogin();
    } catch (error) {
      hideLoading();
      console.log('Login error: ', error);
      Alert.alert(
        'Error',
        error.message || error
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
    this.props.navigation.navigate('App');
  }

  _handleKeyBoardToggle = (visible) => {
    this.setState({keyboardVisible: visible});
  }

  render() {
    const versionText = `v${pkg.version}`
    return (
      <View style={[styles.container, styles.scroll]}>
        <View style={styles.headerImageContainer}>
          <Image
            style={styles.headerImage}
            resizeMode="contain"
            source={require('../assets/images/logo-doup.png')}
          />
        </View>

        <View style={styles.loginForm}>
          <TextInput
            value={this.state.username}
            placeholder="Usuario"
            ref="usuario"
            style={[styles.textInput, {color: 'black'}]}
            placeholderTextColor="gray"
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
            style={[styles.textInput, {color: 'black'}]}
            autoCapitalize='none'
            autoCorrect={false}
            placeholderTextColor="gray"
            underlineColorAndroid="transparent"
            secureTextEntry
            returnKeyType="go"
            onChangeText={this._handlePasswordTextChange}
            onSubmitEditing={this._handleLoginButtonPress}
          />

          <View style={styles.actionButtonsContainer}>
            <View style={styles.actionButtons}>
              <Button
                title="Login"
                color="#4b944d"
                style={styles.loginButton}
                onPress={this._handleLoginButtonPress}
              />

              {!this.state.keyboardVisible &&
              <Text
                onPress={this._handleRegisterTextPress}
                style={styles.notRegisteredButton}>
                No estoy registrado
              </Text>
              }

              {!this.state.keyboardVisible &&
              <Text
                style={styles.notRegisteredButton}>
                {versionText}
              </Text>
              }
            </View>
          </View>

          {/* The next view will animate to match the actual keyboards height */}
          <KeyboardSpacer onToggle={this._handleKeyBoardToggle}/>
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
    backgroundColor: '#30282a'
  },
  headerImageContainer: {
    marginTop: 20,
    height: '35%',
    width: '100%'
  },
  headerImage: {
    flex: 1,
    width: undefined,
    height: undefined
  },
  loginForm: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButtonsContainer: {
    flex: 1,
    justifyContent: 'space-around',
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
  loginButton: {
    color: '#4b944d',
    width: 250
  },
  scroll: {
    padding: 30
  },
  notRegisteredButton: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#f3fffe',
    textDecorationLine: 'underline'
  }
});
