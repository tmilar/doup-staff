import React from 'react';
import {ActivityIndicator, AsyncStorage, View, Alert} from 'react-native'
import LessonInfo from './LessonInfo'
import client from "../service/RequestClient";
import moment from 'moment-timezone'

export default class LessonInfoContainer extends React.Component {

  static defaultProps = {
    onLessonFetch: lesson => console.log("Fetched lesson... ", lesson),
    lessonHeader: ''
  }

  state = {
    lesson: null,
    loading: false
  }

  _fetchNextLesson = async () => {
    return client.sendRequest('/lesson/next');
  }

  _fetchAndSaveNextLesson = async () => {
    const nextLesson = await this._fetchNextLesson()
    console.log("Next lesson: ", nextLesson)

    // store result in cache
    if (nextLesson) {
      console.log("storing 'nextLesson' in cache.")
      await AsyncStorage.setItem('nextLesson', JSON.stringify(nextLesson))
    }
    return nextLesson;
  }

  _isLessonExpired = (lesson) => {
    let now = moment();
    let lessonEnd = moment(lesson.endDate);
    let lessonExpiration = moment(lessonEnd).add(30, "minutes")

    return now.isAfter(lessonExpiration)
  }

  /**
   * Retrieve the currently stored lesson, or fetch & retrieve the next one.
   *
   * @returns {Promise<any>}
   * @private
   */
  _retrieveNextLesson = async () => {
    // get or fetch lesson
    let nextLesson = JSON.parse(await AsyncStorage.getItem('nextLesson') || null)
    if(nextLesson) {
      console.log("Retrieved 'nextLesson' from cache. ")
    }

    let isLessonExpired = this._isLessonExpired(nextLesson)
    let shouldRefreshNextLesson = !nextLesson || isLessonExpired

    if (shouldRefreshNextLesson) {
      if(isLessonExpired) {
        console.log("Current lesson expired, retrieving the next one. ")
      } else {
        console.log("No next lesson set, retrieving the next one.")
      }
      nextLesson = await this._fetchAndSaveNextLesson();
    }

    this.props.onLessonFetch(nextLesson)

    return nextLesson;
  }

  async componentWillMount() {
    this.setState({loading: true})
    try {
      const nextLesson = await this._retrieveNextLesson();
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
