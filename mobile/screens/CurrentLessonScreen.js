import React from 'react';
import {Alert, Button, StyleSheet, View} from "react-native";
import {Feather as FeatherIcon} from "@expo/vector-icons";
import LessonInfoContainer from "../components/LessonInfoContainer";
import LessonService from '../service/LessonService';
import moment from "moment";
import {hideLoading, showLoading} from 'react-native-notifyer';

const MAX_TIMEOUT_MILLIS = moment.duration(3, 'minutes').asMilliseconds();

export default class CurrentLessonScreen extends React.Component {

  state = {
    currentLesson: null,
    canFinishCurrentLesson: false
  }

  _setCurrentLessonCanFinish = (canFinishCurrentLesson = true) => {
    this.setState({canFinishCurrentLesson})
  }

  _checkOrScheduleCanLessonFinish = () => {
    const {currentLesson} = this.state

    if (!currentLesson) {
      return
    }

    const now = moment()
    const canLessonFinishMinTime = moment(currentLesson.endDate).add(LessonService.LESSON_TIME_TOLERANCE.END.MIN)
    const canLessonFinishMaxTime = moment(currentLesson.endDate).add(LessonService.LESSON_TIME_TOLERANCE.END.MAX)

    const lessonCanFinishAction = () => this._setCurrentLessonCanFinish()
    const lessonCanNotFinishAction = () => {
      this._setCurrentLessonCanFinish(false)
      this.props.navigation.navigate('UpcomingLesson')
    }

    // check & set if can now be finished
    if (now.isBetween(canLessonFinishMinTime, canLessonFinishMaxTime, null, '[]')) {
      console.log("Current lesson is already able to be finished. ")
      lessonCanFinishAction()
    }

    // check & schedule for can finish time
    if (now.isBefore(canLessonFinishMinTime)) {
      const remainingFinishTime = canLessonFinishMinTime.diff(now)
      if (remainingFinishTime < MAX_TIMEOUT_MILLIS) {
        console.log(`Scheduling lesson can finish in ${remainingFinishTime} ms`)
        this.canLessonFinishTimeout = setTimeout(
          () => {
            console.log("Current lesson can now be finished. ")
            lessonCanFinishAction()
          },
          remainingFinishTime
        )
      }
    }

    // check & schedule for can finish stop time
    if (now.isBefore(canLessonFinishMaxTime)) {
      const remainingFinishStopTime = canLessonFinishMaxTime.diff(now)
      if (remainingFinishStopTime < MAX_TIMEOUT_MILLIS) {
        console.log(`Scheduling lesson can no longer be finished in ${remainingFinishStopTime} ms`)
        this.expireLessonFinishTimeout = setTimeout(
          () => {
            console.log("Current lesson can no longer be finished. ")
            lessonCanNotFinishAction()
          },
          remainingFinishStopTime
        )
      }
    }


    if (now.isAfter(canLessonFinishMaxTime)) {
      lessonCanNotFinishAction()
    }

  }

  componentDidMount() {
    this._checkOrScheduleCanLessonFinish();
  }

  componentWillUnmount() {
    clearTimeout(this.canLessonFinishTimeout)
    clearTimeout(this.expireLessonFinishTimeout)
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
          Alert.alert("¡Listo!", "Has finalizado tu clase. \n¡Hasta la próxima! \ud83d\udc4b")
        } catch (error) {
          hideLoading()
          console.error("Problem sending finish lesson request", error)
          let errMsg = "Ocurrió un problema al finalizar tu clase. Por favor, vuelve a intentarlo."
          if (error.status !== 500) {
            errMsg = error.message || errMsg
          }
          Alert.alert("¡Ups!", errMsg)
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

  _showDisabledInfo = () => {
    const {currentLesson} = this.state
    let infoMsg

    if (!currentLesson) {
      infoMsg = 'Tu próxima clase aún no está disponible en el sistema. ' +
        '\nSi crees que es un error, por favor, ¡avísanos!'
    } else {
      const {MIN: endMin, MAX: endMax} = LessonService.LESSON_TIME_TOLERANCE.END
      const endMinStr = endMin.humanize()
      const endMaxStr = endMax.humanize()
      infoMsg = `Tu clase actual podrá ser finalizada sólo en el rango de ${endMinStr} antes a ${endMaxStr} después del horario de fin de la misma.`
    }

    Alert.alert('Info', infoMsg)
  }

  _turnEndButton = () => {
    const {canFinishCurrentLesson} = this.state
    const isDisabled = !canFinishCurrentLesson;

    let actionButtonViewStyle = styles.actionButtonView
    if (isDisabled) {
      actionButtonViewStyle = [styles.actionInfoView, styles.actionButtonView]
    }

    return (
      <View style={actionButtonViewStyle}>
        <Button title="Finalizar Turno" disabled={isDisabled}
                onPress={this._completeCurrentTurn}/>
        {isDisabled &&
        <FeatherIcon name="info" size={28} color="gray"
                     style={styles.actionInfo}
                     onPress={this._showDisabledInfo}/>}
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
