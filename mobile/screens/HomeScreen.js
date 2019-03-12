import React from 'react';
import {Alert, Button, StyleSheet, View, Text, AsyncStorage} from 'react-native';
import client from '../service/RequestClient'

export default class HomeScreen extends React.Component {

  state = {
    isTurnStart: true,
    isTurnEnd: false,
    username: ''
  }

  async componentWillMount() {
    const profile = await AsyncStorage.getItem('userProfile')
    if (profile) {
      const {firstName} = JSON.parse(profile)
      this.setState({firstName})
    }
  }

  _goToUploadScreen = () => {
    this.props.navigation.navigate('Upload', {
      onFinish: () => {
        this.setState({
          isTurnStart: true,
          isTurnEnd: false
        })
      }
    });
  };

  _startTurn = async ({report}) => {
    if (report) {
      // TODO ask for pic upload or write more details?
      try {
        await client.sendRequest('/report', {
          method: 'POST',
          body: {
            comment: '' //TODO use actual comment
          }
        })
        Alert.alert('Gracias', 'Gracias por notificarnos, con esto podremos verificar qué sucedió y tomar medidas para que no se repita nuevamente.')
      } catch (error) {
        console.error(error)
        Alert.alert('Error', 'Error de comunicacion con el servidor :( \nPor favor contacta a la administración!')
        return
      }
    } else {
      Alert.alert('Gracias', 'Qué bueno que esté todo en condiciones!')
    }

    this.setState({
      isTurnStart: false,
      isTurnEnd: true
    })
  }

  _reviewPreviousTurn = () => {
    Alert.alert(
      'Turno previo',
      'Has recibido el espacio en buenas condiciones, listo para comenzar tu turno?',
      [{
        text: 'No, podría estar mejor.',
        onPress: () => this._startTurn({report: true}),
        style: 'cancel'
      }, {
        text: 'Sí, todo OK!',
        onPress: () => this._startTurn({report: false})
      }]
    );
  }

  _maybeShowWelcomeMessage = () => {
    if (this.state.isTurnStart) {
      const message = `Hola${this.state.firstName ? `, ${this.state.firstName}` : ''}!`
      return (
        <Text style={styles.welcomeMessage}>{message}</Text>
      )
    }
  }

  _maybeShowTurnStartButton = () => {
    if (this.state.isTurnStart) {
      return (
        <View>
          <View style={styles.actionButton}>
            <Button title="Comenzar Turno" onPress={this._reviewPreviousTurn}/>
          </View>
        </View>
      )
    }
  }

  _maybeShowTurnEndButton = () => {
    if (this.state.isTurnEnd) {
      return (
        <View style={styles.actionButton}>
          <Button title="Finalizar Turno" onPress={this._goToUploadScreen}/>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this._maybeShowWelcomeMessage()}
        {this._maybeShowTurnStartButton()}
        {this._maybeShowTurnEndButton()}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcomeMessage: {
    fontSize: 20,
    marginBottom: 40
  },
  actionButton: {
    marginBottom: 20
  }
});
