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
    const currentLesson = JSON.parse(await AsyncStorage.getItem('currentLesson'))
    this._goToUploadScreen(currentLesson)
  }

  _turnEndButton = () => {
    return (
      <View style={styles.actionButton}>
        <Button title="Finalizar Turno" onPress={this._completeCurrentTurn}/>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <LessonInfoContainer/>
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
