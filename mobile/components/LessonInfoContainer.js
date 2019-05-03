import React from 'react';
import {ActivityIndicator, Alert, View} from 'react-native'
import LessonInfo from './LessonInfo'
import LessonService from "../service/LessonService"

export default class LessonInfoContainer extends React.Component {

  static defaultProps = {
    onLessonFetch: lesson => console.log("Fetched lesson... ", lesson),
    lessonHeader: ''
  }

  state = {
    lesson: null,
    loading: false
  }

  async componentWillMount() {
    this.setState({loading: true})
    try {
      const nextLesson = await LessonService.retrieveNextLesson()
      this.props.onLessonFetch(nextLesson)
      this.setState({lesson: nextLesson, loading: false})
    } catch (error) {
      console.error("Error when retrieving next lesson...", error)
      Alert.alert("Ups...",
        "Ocurrió un error al recuperar tu próxima clase :(" +
        "\nPor favor, ¡avisa a la administración!")
    }
  }

  render() {
    const {loading, lesson} = this.state

    if (loading) {
      return (
        <View style={{minHeight: 80}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return <LessonInfo header={this.props.lessonHeader} lesson={lesson}/>
  }
}
