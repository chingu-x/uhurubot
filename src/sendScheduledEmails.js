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
  let eligibleMembers = await getEligibleMembers()
  console.log('eligibleMembers: ', eligibleMembers)


  for (let member of eligibleMembers) {
    console.log('member: ', member)
    // Using the current date, calculate for each member how many days have 
    // elapsed since their application was approved & which email should be sent
    // based on the schedule.
    const oneDay = 1000 * 60 * 60 * 24
    const now = new Date()
    const approvalDate = new Date(member.applicationApprovalDate)
    let daysSinceApplication = Math.floor((now.getTime() - approvalDate.getTime()) / oneDay)

    // Set the status and status date for the event if:
    // - No events have been recorded see if the first one for the 
    // notificationType is due
    // - Events have been added see if the next one for the notificationType
    // is due
    if (member.notificationEvents.length === 0) {
      if (schedule[0].admissionOffset <= daysSinceApplication) {
        console.log(`Matched against user ${ member.email } with no events`)
        // Create a Notification Event row for the first notification of this type
        // Send the email
      }
    } else {
      for (let event of member.notificationEvents) {
        if (['Sent', 'Cancelled'].indexOf(event.status) < 0 && 
          schedule.schedule[0].admissionOffset <= daysSinceApplication) {
          console.log(`Matched against user: ${ event.email } with event: ${ event.notificationType}, status: ${ event.status }` )
          // Send the email
        }
      }
    }

    // If the email was successful update the Notification Events table 
    // to record the event
    

    // If the last email for this notification type has been sent update the
    // Notification Queue table to mark the notification as finished.

  }


}

export default emailScheduledMessages