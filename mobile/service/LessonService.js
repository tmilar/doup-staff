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

  startNextLesson = async lesson => {
    const startedLesson = await client.sendRequest(`/lesson/${lesson._id}/start`, {
      method: 'POST'
    })

    // update stored lesson
    await AsyncStorage.setItem('nextLesson', JSON.stringify(startedLesson))

    return startedLesson
  }

  /**
   * Check if lesson is expired (current time is more than *30* minutes after end date).
   *
   * @param lesson
   * @returns {*}
   * @private
   */
  _isLessonExpired = lesson => {
    const now = moment();
    const lessonEnd = moment(lesson.endDate);
    const lessonExpiration = moment(lessonEnd).add(30, "minutes")

    return now.isAfter(lessonExpiration)
  }

  /**
   * Fetch next lesson from server and store in cache
   *
   * @returns {Promise<*>}
   * @private
   */
  _fetchAndSaveNextLesson = async () => {
    let nextLesson

    try {
      nextLesson = await this._fetchNextLesson()
      console.log("[LessonService] Fetched next lesson:", nextLesson)
    } catch (error) {
      console.error("Could not fetch next lesson", error)
    }

    // store result in cache
    if (nextLesson) {
      console.log("[LessonService] storing fetched 'nextLesson' in cache. ")
      await AsyncStorage.setItem('nextLesson', JSON.stringify(nextLesson))
    } else {
      let logMsg = "[LessonService] no next lesson fetched"
      if(await AsyncStorage.getItem('nextLesson')) {
        logMsg += ", removing 'nextLesson' from cache."
        await AsyncStorage.removeItem('nextLesson')
      }
      console.log(logMsg)
    }
    return nextLesson;
  }

  /**
   * Fetch next lesson from server.
   *
   * @returns {Promise<*>}
   * @private
   */
  _fetchNextLesson = async () => {
    return client.sendRequest('/lesson/next');
  }
}

const lessonService = new LessonService()
module.exports = lessonService
