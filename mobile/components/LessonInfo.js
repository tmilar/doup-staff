import React from 'react';
import {StyleSheet, Text} from 'react-native'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'

export default class LessonInfo extends React.Component {

  lessonMessage = (lesson, header) => {
    const {discipline, site, startDate, endDate} = lesson
    const startStr = moment(startDate).calendar()
    const endStr = moment(endDate).format("H:mm")

    const lessonStr = `${discipline}, en ${site}, ${startStr} - ${endStr}.`

    return `${header}${lessonStr}`
  }


  render() {
    const {lesson, header} = this.props
    const defaultMessage = 'Tu próxima clase aún no fue cargada en el sistema.'
    const lessonMessage = lesson ? this.lessonMessage(lesson, header) : defaultMessage

    return (
      <Text style={styles.lessonMessage}>{lessonMessage}</Text>
    )
  }
}

const styles = StyleSheet.create({
  lessonMessage: {
    fontSize: 20,
    marginBottom: 40,
    justifyContent: 'center',
    textAlign: 'center'
  }
})
