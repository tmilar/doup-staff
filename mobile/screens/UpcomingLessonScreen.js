import React from 'react';
import {AsyncStorage, Button, StyleSheet, Text, View} from 'react-native'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'
import LessonInfoContainer from '../components/LessonInfoContainer'
import LessonService from '../service/LessonService'

moment.locale('es');
moment.tz.setDefault("America/Argentina/Buenos_Aires");

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

  _setUpcomingLessonCanStart = () => {
    this.setState({canStartNextLesson: true})
  }

  _checkOrScheduleCanLessonStart = () => {
    const {nextLesson} = this.state

    if (!nextLesson) {
      return
    }
    // lesson can start 10 minutes before start date.
    const canLessonStartTime = moment(nextLesson.startDate).add(LessonService.LESSON_TIME_TOLERANCE.START.MIN)
    const now = moment()

    if (now.isBefore(canLessonStartTime)) {
      const remainingTime = canLessonStartTime.diff(now)
      console.log(`Scheduling lesson can start in ${remainingTime} ms`)

      this.canLessonStartTimeout = setTimeout(
        () => {
          console.log("Next lesson can now be started. ")
          this._setUpcomingLessonCanStart()
        },
        remainingTime
      )
    } else {
      console.log("Next lesson is already able to be started. ")
      this._setUpcomingLessonCanStart()
    }
  }

  componentDidMount() {
    this._checkOrScheduleCanLessonStart();
  }

  componentWillUnmount() {
    clearTimeout(this.canLessonStartTimeout)
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

    // TODO if lesson startTime is over >20 minutes ago, navigate to currentlesson screen
    return (
      <View>
        <View style={styles.actionButton}>
          <Button title="Comenzar Turno" disabled={!canStartNextLesson} onPress={this._startNextLesson}/>
        </View>
      </View>
    )
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
  actionButton: {
    marginBottom: 20
  }
});
