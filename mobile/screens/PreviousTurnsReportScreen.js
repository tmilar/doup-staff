import React from 'react';
import {Alert, StyleSheet, View} from 'react-native'
import {showLoading, hideLoading} from 'react-native-notifyer';
import LessonService from "../service/LessonService";
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

  _handleReport = async report => {
    let promptTitle, promptMessage, actionMessage
    let errorResult = null

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
        errorResult = error
      }
    } else {
      promptTitle = 'Gracias'
      promptMessage = '¡Qué bueno que esté todo en condiciones!'
      actionMessage = '¡Sí!'
    }

    return new Promise((resolve, reject) => Alert.alert(promptTitle, promptMessage, [{
      text: actionMessage,
      onPress: () => errorResult ? reject(errorResult) : resolve()
    }]))
  }

  _startTurn = async ({report}) => {
    try {
      await this._handleReport(report)
    } catch (error) {
      console.log("[PreviousTurnReportScreen] Error when handling report, going back.", error)
      this.props.navigation.goBack()
      return
    }

    const lesson = this.props.navigation.getParam('lesson', null)

    if (!lesson) {
      console.error("[PreviousTurnReportScreen] No 'lesson' param in navigation props, going back.")
      this.props.navigation.goBack()
      return
    }

    try {
      showLoading({text: 'Cargando...'});
      const startedLesson = await LessonService.startNextLesson(lesson)
      console.log(`[PreviousTurnReportScreen] Lesson started at time ${startedLesson.actualStartDate}`)
      hideLoading()
    } catch (error) {
      hideLoading()
      console.error("[PreviousTurnReportScreen] Could not start next lesson. ", error)
      let errMsg = `Ocurrió un problema al iniciar tu clase${error.message ? `: ${error.message}` : ''}` +
        '\nPor favor, ¡avisa a la administración!'
      if (error.status !== 500) {
        errMsg = error.message || errMsg
      }
      Alert.alert("Ups...", errMsg, [{
        text: 'OK',
        onPress: () => this.props.navigation.goBack()
      }])
      return
    }

    this.props.navigation.navigate('CurrentLesson')
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
    return <View style={styles.container}/>
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
