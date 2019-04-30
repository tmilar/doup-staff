import React from 'react';
import {Alert, StyleSheet, View} from 'react-native'
import client from "../service/RequestClient";

export default class PreviousTurnsReportScreen extends React.Component {

  _sendReport = async () => {
    // TODO ask for pic upload or write more details?
    const comment = '' //TODO use actual comment
    const date = new Date()

    await client.sendRequest('/report', {
      method: 'POST',
      body: {comment, date}
    })
  }

  _startTurn = async ({report}) => {
    let promptTitle, promptMessage, actionMessage

    let nextAction = () => this.props.navigation.navigate('CurrentLesson')

    if (report) {
      try {
        await this._sendReport();
        promptTitle = 'Gracias'
        promptMessage = '¡Gracias por notificarnos! Con tu ayuda, podremos verificar qué sucedió y evaluar alternativas para que no se repita nuevamente.'
        actionMessage = '¡De nada!'
      } catch (error) {
        console.error(error)

        promptTitle = 'Error'
        promptMessage = 'Error de comunicación con el servidor. \nPor favor contacta a la administración!'
        actionMessage = 'OK.'
        nextAction = () => this.props.navigation.goBack()
      }
    } else {
      promptTitle = 'Gracias'
      promptMessage = '¡Qué bueno que esté todo en condiciones!'
      actionMessage = '¡Sí!'
    }

    Alert.alert(promptTitle, promptMessage, [{
      text: actionMessage,
      onPress: nextAction
    }])
  }

  componentWillMount() {
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

  render() {
    return (<View style={styles.container}/>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
