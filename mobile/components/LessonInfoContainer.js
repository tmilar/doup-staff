import React from 'react';
import {ActivityIndicator, AsyncStorage, View} from 'react-native'
import LessonInfo from './LessonInfo'
import client from "../service/RequestClient";
import moment from "moment";

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

    // store in cache
    if (nextLesson) {
      console.log("GET /lesson/next -> storing in cache 'nextLesson': ", nextLesson)
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

    let shouldRefreshNextLesson = !nextLesson || this._isLessonExpired(nextLesson)

    if (shouldRefreshNextLesson) {
      nextLesson = await this._fetchAndSaveNextLesson();
    }

    this.props.onLessonFetch(nextLesson)

    return nextLesson;
  }

  async componentWillMount() {
    this.setState({loading: true})
    let nextLesson = await this._retrieveNextLesson();
    this.setState({lesson: nextLesson, loading: false})
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
