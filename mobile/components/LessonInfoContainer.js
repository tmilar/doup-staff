import React from 'react';
import {ActivityIndicator, AsyncStorage, View} from 'react-native'
import LessonInfo from './LessonInfo'
import client from "../service/RequestClient";

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
    const nextLesson = await client.sendRequest('/lesson/next')

    // store in cache
    if (nextLesson) {
      await AsyncStorage.setItem('nextLesson', JSON.stringify(nextLesson))
    }
    return nextLesson;
  }

  async componentWillMount() {
    this.setState({loading: true})

    // get or fetch lesson
    let nextLesson = JSON.parse(await AsyncStorage.getItem('nextLesson') || null)

    const isLessonOver = (lesson) => new Date() > new Date(lesson.endDate)

    if (!nextLesson || isLessonOver(nextLesson)) {
      // fetch & save next lesson
      nextLesson = await this._fetchNextLesson()
    }

    this.props.onLessonFetch(nextLesson)

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
