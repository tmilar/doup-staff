import {AsyncStorage} from "react-native";
import {Notifications} from 'expo'
import moment from 'moment'
import 'moment/locale/es'
import 'moment-timezone'
import client from "./RequestClient";

moment.locale('es')

class LessonService {

  LESSON_TIME_TOLERANCE = {
    START: {
      MIN: moment.duration(-10, 'minutes'),
      MAX: moment.duration(15, 'minutes')
    },
    END: {
      MIN: moment.duration(-5, 'minutes'),
      MAX: moment.duration(10, 'minutes')
    }
  }

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

    // cancel scheduled notifications
    await this.cancelLessonStartReminders();

    return startedLesson
  }

  finishLesson = async lesson => {
    const finishedLesson = await client.sendRequest(`/lesson/${lesson._id}/end`, {
      method: 'POST'
    })

    // update stored lesson
    await AsyncStorage.setItem('nextLesson', JSON.stringify(finishedLesson))

    // cancel scheduled notifications
    await this.cancelLessonEndReminders()

    return finishedLesson
  }

  cancelLessonStartReminders = async () => {
    const key = 'startNotificationIds';
    await this._cancelScheduledNotificationsByKey(key);
  }

  cancelLessonEndReminders = async () => {
    const key = 'endNotificationIds';
    await this._cancelScheduledNotificationsByKey(key)
  }

  _cancelScheduledNotificationsByKey = async key => {
    const ids = JSON.parse(await AsyncStorage.getItem(key) || "[]")
    if (!ids || !ids.length) {
      console.log(`[LessonService] no scheduled notifications found for key '${key}', can't cancel. `)
      return
    }

    console.log(`[LessonService] cancelling scheduled notifications '${key}' ids ${ids}`)
    await this._cancelScheduledNotifications(ids)
    await AsyncStorage.removeItem(key)
  }

  _cancelScheduledNotifications = async ids => {
    return Promise.all(ids.map(Notifications.cancelScheduledNotificationAsync))
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
    const lessonExpiration = moment(lesson.endDate).add((this.LESSON_TIME_TOLERANCE.END.MAX))
    const isLessonOver = !!lesson.actualEndDate

    return isLessonOver || now.isAfter(lessonExpiration)
  }

  /**
   * Check if lesson is still upcoming.
   * A lesson is upcoming if not started yet,
   * and if current time is before startDate
   *
   * @param lesson
   * @returns {boolean|*}
   */
  isUpcoming = lesson => {
    const now = moment()
    const lessonStartMaxLimit = moment(lesson.startDate).add(this.LESSON_TIME_TOLERANCE.START.MAX)
    const alreadyStarted = !!lesson.actualStartDate

    return !alreadyStarted && now.isBefore(lessonStartMaxLimit)
  }

  /**
   * Check if lesson is still current.
   * Is current if has been already started,
   * and if: has not been finished yet, and current time is beofre endDate + end time tolerance.
   *
   * @param lesson
   */
  isCurrent = lesson => {
    const now = moment()
    const lessonStartMaxLimit = moment(lesson.startDate).add(this.LESSON_TIME_TOLERANCE.START.MAX)
    const lessonEndMaxLimit = moment(lesson.endDate).add(this.LESSON_TIME_TOLERANCE.END.MAX)
    const alreadyFinished = !!lesson.actualEndDate
    const alreadyStarted = !!lesson.actualStartDate

    return !alreadyFinished && (alreadyStarted || now.isBetween(lessonStartMaxLimit, lessonEndMaxLimit))
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
      if (await AsyncStorage.getItem('nextLesson')) {
        logMsg += ", removing 'nextLesson' from cache."
        await AsyncStorage.removeItem('nextLesson')
      }
      console.log(logMsg)
    }

    // schedule start & end local reminders
    if (nextLesson) {
      await this.scheduleLessonReminders(nextLesson);
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

  scheduleLessonReminders = async nextLesson => {
    const {
      startNotificationIds,
      endNotificationIds
    } = await this._scheduleLessonNotificationReminders(nextLesson)
    await AsyncStorage.setItem('startNotificationIds', JSON.stringify(startNotificationIds))
    await AsyncStorage.setItem('endNotificationIds', JSON.stringify(endNotificationIds))
    console.log(`[LessonService] scheduled startNotificationIds ${startNotificationIds} and endNotificationIds ${endNotificationIds}`)
  }

  startReminderNotifications = [{
    title: "Tu próximo Turno",
    body: "No te olvides de comenzar tu turno",
    time: ({startDate}) => new Date(startDate).getTime() - (1000 * 60 * 8)
  }, {
    title: "Tu Turno está comenzando",
    body: "Por favor, ¡no olvides confirmar el Comienzo de tu turno!",
    time: ({startDate}) => new Date(startDate).getTime() - (1000 * 60 * 1)
  }]

  endReminderNotifications = [{
    title: "Finalizar Clase",
    body: "Toca aquí para finalizar tu clase.",
    time: ({endDate}) => new Date(endDate).getTime() - (1000 * 60 * 1)
  }, {
    title: "Finalizar Clase",
    body: "Por favor, finaliza tu clase ahora. ¡Última oportunidad!",
    time: ({endDate}) => new Date(endDate).getTime() + (1000 * 60 * 7)
  }]

  _scheduleLessonNotificationReminders = async (nextLesson) => {
    const mapSchedule = notifications =>
      notifications.map(({title, body, time}) =>
        Notifications.scheduleLocalNotificationAsync(
          {title, body},
          {time: time(nextLesson)}
        )
      );

    const startNotificationIds = await Promise.all(mapSchedule(this.startReminderNotifications))
    const endNotificationIds = await Promise.all(mapSchedule(this.endReminderNotifications))

    return {
      startNotificationIds,
      endNotificationIds
    }
  }
}

const lessonService = new LessonService()
module.exports = lessonService
