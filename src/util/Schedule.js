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
    return this.schedule.schedule[0]
  }
}
