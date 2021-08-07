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

  // Get the next event after the event identified by a notification type and
  // message ID. Result:
  // - Current event found: return the event
  // - Current event is the last one: return null
  // - Current event not found: return -1
  getNextEvent(currentNotificationType, currentMessageID) {
    if (this.schedule.name !== currentNotificationType) {
      throw new Error(`Schedule notification type ("${ this.schedule.name }") doesn't match expected type ("${ currentNotificationType }")`)
    }
    for (let i = 0; i < this.schedule.events.length; i++) {
      if (this.schedule.events[i].messageID === currentMessageID) {
        if (i === (this.schedule.events.length - 1) ) {
          return null // Current event was the last one
        }
        return this.schedule.events[i+1] // Return next event
      }
    }
    return -1 // Current event not found
  }

}
