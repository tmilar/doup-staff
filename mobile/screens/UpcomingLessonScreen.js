import React from 'react';
import {Alert, AsyncStorage, Button, StyleSheet, Text, View} from 'react-native'
import {Feather as FeatherIcon} from '@expo/vector-icons'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'
import LessonInfoContainer from '../components/LessonInfoContainer'
import LessonService from '../service/LessonService'

moment.locale('es');
moment.tz.setDefault("America/Argentina/Buenos_Aires");
const MAX_TIMEOUT_MILLIS = moment.duration(3, 'minutes').asMilliseconds();

export default class UpcomingLessonScreen extends React.Component {

  state = {
    nextLesson: null,
    canStartNextLesson: false
  }

  _retrieveFirstName = async () => {
    const profile = await AsyncStorage.getItem('userProfile')
    if (profile) {
      const {firstName} = JSON.parse(profile)
      this.setState({firstName})
    }
  }

  async componentWillMount() {
    await this._retrieveFirstName()
  }

  _setUpcomingLessonCanStart = (canStartNextLesson = true) => {
    this.setState({canStartNextLesson})
  }

  _checkOrScheduleCanLessonStart = () => {
    const {nextLesson} = this.state

    if (!nextLesson) {
      return
    }

    const now = moment()
    const canLessonStartMinTime = moment(nextLesson.startDate).add(LessonService.LESSON_TIME_TOLERANCE.START.MIN)
    const canLessonStartMaxTime = moment(nextLesson.startDate).add(LessonService.LESSON_TIME_TOLERANCE.START.MAX)

    const lessonCanStartAction = () => this._setUpcomingLessonCanStart()
    const lessonCanNotStartAction = () => {
      this._setUpcomingLessonCanStart(false)
      this.props.navigation.navigate('CurrentLesson')
    }

    // check & set if can now be started
    if (now.isBetween(canLessonStartMinTime, canLessonStartMaxTime, null, '[]')) {
      console.log("Next lesson is already able to be started. ")
      lessonCanStartAction()
    }

    // check & schedule for can start time
    if (now.isBefore(canLessonStartMinTime)) {
      const remainingStartTime = canLessonStartMinTime.diff(now)
      if (remainingStartTime < MAX_TIMEOUT_MILLIS) {
        console.log(`Scheduling lesson can start in ${remainingStartTime} ms`)
        this.canLessonStartTimeout = setTimeout(
          () => {
            console.log("Next lesson can now be started. ")
            lessonCanStartAction()
          },
          remainingStartTime
        )
      }
    }

    // check & schedule for can start stop time
    if (now.isBefore(canLessonStartMaxTime)) {
      const remainingStopTime = canLessonStartMaxTime.diff(now)
      if (remainingStopTime < MAX_TIMEOUT_MILLIS) {
        console.log(`Scheduling lesson can no longer be started in ${remainingStopTime} ms`)
        this.expireLessonStartTimeout = setTimeout(
          () => {
            console.log("Next lesson can no longer be started. ")
            lessonCanNotStartAction()
          },
          remainingStopTime
        )
      }
    }


    if (now.isAfter(canLessonStartMaxTime)) {
      lessonCanNotStartAction()
    }
  }

  componentDidMount() {
    this._checkOrScheduleCanLessonStart();
  }

  componentWillUnmount() {
    clearTimeout(this.canLessonStartTimeout)
    clearTimeout(this.expireLessonStartTimeout)
  }

  _welcomeMessage = () => {
    const message = `Hola${this.state.firstName ? `, ${this.state.firstName}` : ''}!`
    return (
      <Text style={styles.welcomeMessage}>{message}</Text>
    )
  }

  _onLessonFetch = lesson => {
    console.log("[UpcomingLessonScreen] Fetched lesson: ", lesson)
    this.setState({nextLesson: lesson}, this._checkOrScheduleCanLessonStart)
  }

  _reviewPreviousTurns = () => {
    this.props.navigation.navigate('PreviousTurnsReport', {
      lesson: this.state.nextLesson
    })
  }

  _startNextLesson = async () => {
    //TODO check if last turns (lesson.site) are same for the user => in that case skip review (or if is same SITE).
    this._reviewPreviousTurns()
  }

  _turnStartButton = () => {
    const {canStartNextLesson} = this.state;
    let isDisabled = !canStartNextLesson

    let actionButtonViewStyle = styles.actionButtonView
    if (isDisabled) {
      actionButtonViewStyle = [styles.actionInfoView, styles.actionButtonView]
    }

    return (
      <View>
        <View style={actionButtonViewStyle}>
          <Button title="Comenzar Turno" disabled={isDisabled} onPress={this._startNextLesson}/>
          {isDisabled &&
          <FeatherIcon name="info" size={28} color="gray"
                       style={styles.actionInfo}
                       onPress={this._showDisabledInfo}/>}
        </View>
      </View>
    )
  }

  _showDisabledInfo = () => {
    const {nextLesson} = this.state
    let infoMsg

    if (!nextLesson) {
      infoMsg = 'Tu próxima clase aún no está disponible en el sistema. ' +
        '\nSi crees que es un error, por favor, ¡avísanos!'
    } else {
      const {MIN: startMin, MAX: startMax} = LessonService.LESSON_TIME_TOLERANCE.START
      const startMinStr = startMin.humanize()
      const startMaxStr = startMax.humanize()
      infoMsg = `Tu próximo turno podrá ser comenzado sólo en el rango de ${startMinStr} antes, y hasta ${startMaxStr} después del horario de inicio.`
    }

    Alert.alert('Info', infoMsg)
  }

  render() {
    const lessonHeaderStr = 'Próxima clase: '
    return (
      <View style={styles.container}>
        {this._welcomeMessage()}
        <LessonInfoContainer lessonHeader={lessonHeaderStr} onLessonFetch={this._onLessonFetch}/>
        {this._turnStartButton()}
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
  actionButtonView: {
    marginBottom: 20
  },
  actionInfoView: {
    marginLeft: 28,
    flexDirection: 'row',
  },
  actionInfo: {
    marginLeft: 5,
    marginTop: 3
  }
});
