import React from 'react';
import {Alert, AsyncStorage, Button, StyleSheet, Text, View} from 'react-native'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'
import LessonInfoContainer from '../components/LessonInfoContainer'

moment.locale('es');
moment.tz.setDefault("America/Argentina/Buenos_Aires");
const _10_SECONDS_MILLIS = 1000 * 10

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

  _checkCanStartNextLesson = () => {
    const {nextLesson} = this.state

    let canStartNextLesson = nextLesson &&
      moment().isBetween(
        moment(nextLesson.startDate).subtract(10, "minutes"),
        moment(nextLesson.startDate).add(20, "minutes")
      );

    this.setState({canStartNextLesson})
    return canStartNextLesson
  }

  _startCheckLessonStartInterval = () => {
    this.checkLessonStartInterval = setInterval(
      () => this._checkCanStartNextLesson(),
      _10_SECONDS_MILLIS
    );
  }

  componentDidMount() {
    this._startCheckLessonStartInterval();
  }

  componentWillUnmount() {
    clearInterval(this.checkLessonStartInterval);
  }

  _welcomeMessage = () => {
    const message = `Hola${this.state.firstName ? `, ${this.state.firstName}` : ''}!`
    return (
      <Text style={styles.welcomeMessage}>{message}</Text>
    )
  }

  _onLessonFetch = lesson => {
    console.log("[UpcomingLessonScreen] Fetched lesson: ", lesson)
    this.setState({nextLesson: lesson}, this._checkCanStartNextLesson)
  }

  _reviewPreviousTurns = () => {
    this.props.navigation.navigate('PreviousTurnsReport')
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
