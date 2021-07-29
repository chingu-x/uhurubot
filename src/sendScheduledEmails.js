import FileOps from './FileOps.js'

const emailScheduledMessages = async (environment, SCHEDULE) => {
  const rawSchedule = FileOps.readFile(SCHEDULE)
  const schedule = JSON.parse(rawSchedule)
  console.log('schedule: ', schedule)

  // Scan Notification Status table to identify members where at least one
  // email remains to be sent and have not:
  // 1. Unsubscribed from emails
  // 2. Submitted a Solo Project Status
  // 3. Become an inactive member

  // Using the current date, for each member calculate how many days have 
  // elapsed since their application was approved & which email should be sent

  // Process the list of emails to be sent. Each entry will be sent to
  // UhuruBE for transmission
}

export default emailScheduledMessages