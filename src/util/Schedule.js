import dotenv from 'dotenv'
import FileOps from './FileOps.js'

export default class Schedule {
  constructor(SCHEDULE) {
    this.schedule = JSON.parse(FileOps.readFile(SCHEDULE))
  }

  getSchedule() {
    return this.schedule
  }

  getFirstEvent(notificationType) {
    if (notificationType !== this.schedule.name) {
      throw new Error(`Schedule notification type ("${ this.schedule.name }") doesn't match expected type ("${ notificationType }")`)
    }
    return this.schedule.events[0]
  }

  getNextEvent(notificationType, messageID) {
    if (this.schedule.name !== notificationType) {
      throw new Error(`Schedule notification type ("${ this.schedule.name }") doesn't match expected type ("${ notificationType }")`)
    }
    for (let i = 0; i < this.schedule.events.length; i++) {
      if (this.schedule.events[i].messageID === messageID) {
        if (i === (this.schedule.events.length - 1) ) {
          return null // All events have been completed
        }
        return this.schedule.events[i+1]
      }
    }
  }
}
