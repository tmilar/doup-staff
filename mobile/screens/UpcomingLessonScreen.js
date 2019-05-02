import React from 'react';
import {Alert, AsyncStorage, Button, StyleSheet, Text, View} from 'react-native'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'
import LessonInfoContainer from '../components/LessonInfoContainer'

moment.locale('es');
moment.tz.setDefault("America/Argentina/Buenos_Aires");

export default class UpcomingLessonScreen extends React.Component {

  state = {
    nextLesson: null
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

  _welcomeMessage = () => {
    const message = `Hola${this.state.firstName ? `, ${this.state.firstName}` : ''}!`
    return (
      <Text style={styles.welcomeMessage}>{message}</Text>
    )
  }

  _onLessonFetch = lesson => {
    console.log("[UpcomingLessonScreen] Fetched lesson: ", lesson)
    this.setState({nextLesson: lesson})
  }

  _reviewPreviousTurns = () => {
    Alert.alert("atenti", "Navegando al reporte del turno previo...")
    this.props.navigation.navigate('PreviousTurnsReport')
  }

  _startNextLesson = async () => {
    //TODO check if last turns are same user => in that case skip review
    this._reviewPreviousTurns()
    const {nextLesson} = this.state
    await AsyncStorage.setItem('currentLesson', JSON.stringify(nextLesson))
  }

  _turnStartButton = () => {
    const {nextLesson} = this.state

    const canStartNextLesson = nextLesson &&
      moment().isBetween(
        moment(nextLesson.startDate).subtract(10, "minutes"),
        moment(nextLesson.startDate).add(20, "minutes")
      )

    // TODO if lesson has already started >20 minutes ago, navigate to currentlesson screen
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
