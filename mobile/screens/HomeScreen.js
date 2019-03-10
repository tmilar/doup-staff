import React from 'react';
import {Alert, Button, StyleSheet, View, Text, AsyncStorage} from 'react-native';

export default class HomeScreen extends React.Component {

  state = {
    isTurnStart: true,
    isTurnEnd: false,
    username: ''
  }


  async componentWillMount() {
    const profile = await AsyncStorage.getItem('userProfile')
    if(profile) {
      const {username} = JSON.parse(profile)
      this.setState({username})
    }
  }

  _goToUploadScreen = () => {
    this.props.navigation.navigate('Upload')
  };

  _startTurn = ({report}) => {
    if (report) {
      // TODO send report to API for notification
      // TODO ask for pic upload or write more details?
      Alert.alert('Gracias', 'Gracias por notificarnos, con esto podremos verificar qué sucedió y tomar medidas para que no se repita nuevamente.')
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
      const message = `Hola${this.state.username ? `, ${this.state.username}` : ''}!`
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
