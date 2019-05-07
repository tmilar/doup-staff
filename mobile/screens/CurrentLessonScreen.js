import React from 'react';
import {AsyncStorage, Button, StyleSheet, View, Alert} from "react-native";
import LessonInfoContainer from "../components/LessonInfoContainer";
import LessonService from '../service/LessonService';

export default class CurrentLessonScreen extends React.Component {

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
          const {actualEndDate} = await LessonService.finishLesson(currentLesson)
          console.log(`[CurrentLessonScreen] Lesson finished at ${actualEndDate}`)
        } catch (error) {
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
        <Button title="Finalizar Turno" onPress={this._completeCurrentTurn}/>
      </View>
    )
  }

  _onLessonFetch = lesson => {
    console.log("[CurrentLessonScreen] Fetched lesson: ", lesson)
    this.setState({currentLesson: lesson})
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
