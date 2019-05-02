import React from 'react';
import {AsyncStorage, Button, StyleSheet, View} from "react-native";
import LessonInfoContainer from "../components/LessonInfoContainer";

export default class CurrentLessonScreen extends React.Component {

  _goToUploadScreen = lesson => {
    this.props.navigation.navigate('Upload', {
      lesson,
      onFinish: async () => {
        // TODO switch / replace?? since we going back to beginning
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
