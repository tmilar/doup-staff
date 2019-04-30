import React from 'react';
import {Alert, Button, StyleSheet, View, Text, AsyncStorage} from 'react-native'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'
import client from '../service/RequestClient'
import LessonInfoContainer from '../components/LessonInfoContainer'

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

  _updateNextLesson = async () => {
    const nextLesson = await client.sendRequest('/lesson/next')
    if (nextLesson) {
      await AsyncStorage.setItem('nextLesson', JSON.stringify(nextLesson))
    }
    return nextLesson;
  }

  _retrieveNextLesson = async () => {
    let nextLesson = JSON.parse(await AsyncStorage.getItem('nextLesson') || null)
    if (!nextLesson) {
      // fetch & save next lesson
      nextLesson = await this._updateNextLesson();
    }
    this.setState({nextLesson})
  }

  async componentWillMount() {
    await this._retrieveFirstName()
    await this._retrieveNextLesson()
  }

  _goToUploadScreen = lesson => {
    this.props.navigation.navigate('Upload', {
      lesson,
      onFinish: async () => {
        await this._updateNextLesson()
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
        Alert.alert('Error', 'Error de comunicación con el servidor. \nPor favor contacta a la administración!')
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

  _completeCurrentTurn = async () => {
    const currentLesson = JSON.parse(await AsyncStorage.getItem('nextLesson'))
    this._goToUploadScreen(currentLesson)
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

  _maybeShowTurnStartButton = () => {
    const {isTurnStart, nextLesson} = this.state

    if (!isTurnStart) {
      return
    }

    const canStartNextLesson = nextLesson &&
      moment().isBetween(
        moment(nextLesson.startDate).subtract(10, "minutes"),
        moment(nextLesson.startDate).add(20, "minutes")
      )

    return (
      <View>
        <View style={styles.actionButton}>
          <Button title="Comenzar Turno" disabled={!canStartNextLesson} onPress={this._reviewPreviousTurn}/>
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
        <Button title="Finalizar Turno" onPress={this._completeCurrentTurn}/>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this._maybeShowWelcomeMessage()}
        <LessonInfoContainer/>
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
