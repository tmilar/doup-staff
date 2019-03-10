import React from 'react';
import {Alert, Button, StyleSheet, View, Text} from 'react-native';

export default class HomeScreen extends React.Component {

  state = {
    isTurnStart: true,
    isTurnEnd: false
  }

  _goToUploadScreen = () => {
    this.props.navigation.navigate('Upload')
  };

  _startTurn = ({report}) => {
    if(report) {
      // TODO send report to API for notification
      // TODO ask for pic upload or write more details?
      Alert.alert("Gracias", "Gracias por notificarnos, con esto podremos verificar qué sucedió y tomar medidas para que no se repita nuevamente.")
    } else {
      Alert.alert("Gracias", "Qué bueno que esté todo en condiciones!")
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

  _maybeShowTurnStartButton = () => {
    if (this.state.isTurnStart) {
      return (
        <View style={{marginBottom: 20}}>
          <Button title="Comenzar Turno" onPress={this._reviewPreviousTurn}/>
        </View>
      )
    }
  }

  _maybeShowTurnEndButton = () => {
    if (this.state.isTurnEnd) {
      return (
        <View style={{marginBottom: 20}}>
          <Button title="Finalizar Turno" onPress={this._goToUploadScreen}/>
        </View>
      )
    }
  }

  render() {
    const username = this.props.navigation.getParam('username')
    return (
      <View style={styles.container}>
        <Text style={{fontSize: 20, marginBottom: 40}}>{`Hola${username ? `, ${username}` : ''}!`}</Text>
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
  }
});
