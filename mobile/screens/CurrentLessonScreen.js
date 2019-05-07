import React from 'react';
import {Alert, Button, StyleSheet, View} from "react-native";
import LessonInfoContainer from "../components/LessonInfoContainer";
import LessonService from '../service/LessonService';
import moment from "moment-timezone";
import {showLoading, hideLoading} from 'react-native-notifyer';

export default class CurrentLessonScreen extends React.Component {

  state = {
    currentLesson: null,
    canFinishCurrentLesson: false
  }

  _setCurrentLessonCanFinish = () => {
    this.setState({canFinishCurrentLesson: true})
  }

  _checkOrScheduleCanLessonFinish = () => {
    const {currentLesson} = this.state

    if (!currentLesson) {
      return
    }

    const now = moment()
    const canLessonFinishTime = moment(currentLesson.endDate).add(LessonService.LESSON_TIME_TOLERANCE.END.MIN)

    if (now.isBefore(canLessonFinishTime)) {
      const remainingTime = canLessonFinishTime.diff(now)
      console.log(`Scheduling lesson can finish in ${remainingTime} ms`)

      this.canLessonFinishTimeout = setTimeout(
        () => {
          console.log("[CurrentLessonScreen] Current lesson can now be finished. ")
          this._setCurrentLessonCanFinish()
        },
        remainingTime
      )
    } else {
      console.log("[CurrentLessonScreen] Current lesson is already able to be finished. ")
      this._setCurrentLessonCanFinish()
    }
  }

  componentDidMount() {
    this._checkOrScheduleCanLessonFinish();
  }

  componentWillUnmount() {
    clearTimeout(this.canLessonFinishTimeout)
  }

  _goToUploadScreen = lesson => {
    this.props.navigation.navigate('Upload', {
      lesson,
      onFinish: async () => {
        const {currentLesson} = this.state

        if (!currentLesson) {
          console.error("No current lesson in state! Can't properly finish")
          return
        }

        try {
          showLoading({text: 'Cargando...'});
          const {actualEndDate} = await LessonService.finishLesson(currentLesson)
          hideLoading()
          console.log(`[CurrentLessonScreen] Lesson finished at ${actualEndDate}`)
          Alert.alert("¡Listo!", "Clase finalizada con éxito. \n¡Hasta la próxima! \ud83d\udc4b")
        } catch (error) {
          hideLoading()
          console.error("Problem sending finish lesson request", error)
          Alert.alert("¡Ups!", "Ocurrió un problema al finalizar tu clase. Por favor, vuelve a intentarlo.")
          return
        }

        this.props.navigation.navigate('UpcomingLesson')
      }
    });
  };

  _completeCurrentTurn = async () => {
    const {currentLesson} = this.state
    this._goToUploadScreen(currentLesson)
  }

  _turnEndButton = () => {
    return (
      <View style={styles.actionButton}>
        <Button title="Finalizar Turno" disabled={!this.state.canFinishCurrentLesson} onPress={this._completeCurrentTurn}/>
      </View>
    )
  }

  _onLessonFetch = lesson => {
    console.log("[CurrentLessonScreen] Fetched lesson: ", lesson)
    this.setState({currentLesson: lesson}, this._checkOrScheduleCanLessonFinish)
  }

  render() {
    const lessonHeaderStr = 'Clase actual: '
    return (
      <View style={styles.container}>
        <LessonInfoContainer lessonHeader={lessonHeaderStr} onLessonFetch={this._onLessonFetch}/>
        {this._turnEndButton()}
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
  actionButton: {
    marginBottom: 20
  }
});
