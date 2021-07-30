import FileOps from './FileOps.js'
import { getEligibleMembers } from './Airtable/NotificationQueue.js'

const emailScheduledMessages = async (environment, SCHEDULE) => {
  const rawSchedule = FileOps.readFile(SCHEDULE)
  const schedule = JSON.parse(rawSchedule)
  console.log('schedule: ', schedule)

  // Scan Notification Queue table to identify members where at least one
  // email remains to be sent and have not:
  // 1. Unsubscribed from emails
  // 2. Submitted a Solo Project
  // 3. Become an inactive member
  await getEligibleMembers()

  // Using the current date, for each member calculate how many days have 
  // elapsed since their application was approved & which email should be sent
  // based on the schedule

  // Process the list of emails to be sent. Each entry will be sent to
  // UhuruBE for transmission and the Notifications table will be updated
  // to record the event and the Notification Queue table will be update when
  // the last email is sent to mark the notification as finished.
}

export default emailScheduledMessages