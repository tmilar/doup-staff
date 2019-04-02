import React from 'react';
import {Alert, Button, StyleSheet, View, Text, AsyncStorage} from 'react-native';
import client from '../service/RequestClient'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'

moment.locale('es');
moment.tz.setDefault("America/Argentina/Buenos_Aires");

export default class HomeScreen extends React.Component {

  state = {
    isTurnStart: true,
    isTurnEnd: false,
    username: '',
    nextLesson: null
  }

  _retrieveFirstName = async () => {
    const profile = await AsyncStorage.getItem('userProfile')
    if (profile) {
      const {firstName} = JSON.parse(profile)
      this.setState({firstName})
    }
  }

  _retrieveNextLesson = async () => {
    const nextLesson = await client.sendRequest('/lesson/next')
    this.setState({nextLesson})
  }

  async componentWillMount() {
    await this._retrieveFirstName()
    await this._retrieveNextLesson()
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
            comment: '', //TODO use actual comment
            date: new Date()
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
    if (!this.state.isTurnStart) {
      return
    }
    const message = `Hola${this.state.firstName ? `, ${this.state.firstName}` : ''}!`
    return (
      <Text style={styles.welcomeMessage}>{message}</Text>
    )
  }

  _maybeShowNextLessonMessage = () => {
    const upcomingLesson = this.state.isTurnStart ? 'Próxima clase' : 'Clase actual'

    const nextLessonMessage = lesson => {
      if (!lesson) {
        return 'No se ha encontrado tu próxima clase.'
      }

      const {discipline, site, startDate, endDate} = lesson
      const startStr = moment(startDate).calendar()
      const endStr = moment(endDate).format("H:mm")

      return `${upcomingLesson}: ${discipline}, en ${site}, ${startStr} - ${endStr}.`
    }

    return (
      <Text style={styles.welcomeMessage}>{nextLessonMessage(this.state.nextLesson)}</Text>
    )
  }

  _maybeShowTurnStartButton = () => {
    if (!this.state.isTurnStart) {
      return
    }

    return (
      <View>
        <View style={styles.actionButton}>
          <Button title="Comenzar Turno" onPress={this._reviewPreviousTurn}/>
        </View>
      </View>
    )
  }

  _maybeShowTurnEndButton = () => {
    if (!this.state.isTurnEnd) {
      return
    }

    return (
      <View style={styles.actionButton}>
        <Button title="Finalizar Turno" onPress={this._goToUploadScreen}/>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this._maybeShowWelcomeMessage()}
        {this._maybeShowNextLessonMessage()}
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
    marginBottom: 40,
    justifyContent: 'center',
    textAlign: 'center'
  },
  actionButton: {
    marginBottom: 20
  }
});
