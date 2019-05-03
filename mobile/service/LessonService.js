import {AsyncStorage} from "react-native";
import moment from "moment-timezone";
import client from "./RequestClient";

class LessonService {

  retrieveNextLesson = async () => {
    // get or fetch lesson
    let nextLesson = JSON.parse(await AsyncStorage.getItem('nextLesson') || null)
    if (nextLesson) {
      console.log("[LessonService] Retrieved 'nextLesson' from cache. ")
    }

    const isLessonExpired = nextLesson && this._isLessonExpired(nextLesson)
    const shouldRefreshNextLesson = !nextLesson || isLessonExpired

    if (shouldRefreshNextLesson) {
      if (isLessonExpired) {
        console.log("[LessonService] Current lesson expired, retrieving the next one. ")
      } else {
        console.log("[LessonService] No next lesson set, retrieving the next one. ")
      }
      nextLesson = await this._fetchAndSaveNextLesson();
    }

    return nextLesson;
  }

  _isLessonExpired = lesson => {
    const now = moment();
    const lessonEnd = moment(lesson.endDate);
    const lessonExpiration = moment(lessonEnd).add(30, "minutes")

    return now.isAfter(lessonExpiration)
  }

  _fetchAndSaveNextLesson = async () => {
    const nextLesson = await this._fetchNextLesson()
    console.log("[LessonService] Fetched next lesson:", nextLesson)

    // store result in cache
    if (nextLesson) {
      console.log("[LessonService] storing 'nextLesson' in cache. ")
      await AsyncStorage.setItem('nextLesson', JSON.stringify(nextLesson))
    }
    return nextLesson;
  }

  _fetchNextLesson = async () => {
    return client.sendRequest('/lesson/next');
  }
}

const lessonService = new LessonService()
module.exports = lessonService
