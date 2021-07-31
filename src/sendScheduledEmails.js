import FileOps from './util/FileOps.js'
import UhuruBE from './util/UhuruBE.js'
import { getEligibleMembers } from './Airtable/NotificationQueue.js'
import { addEvent } from './Airtable/NotificationEvents.js'

const emailScheduledMessages = async (environment, schedule) => {
  const notificationSchedule = schedule.getSchedule()
  console.log('schedule: ', notificationSchedule)

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
      if (notificationSchedule.schedule[0].admissionOffset <= daysSinceApplication) {
        console.log(`Matched against user ${ member.email } with no events`)
        const result = await UhuruBE.sendEmail(
          member.notificationType, member.email, member.firstName, 
          schedule.getFirstEvent(notificationType).messageID,
          schedule.getFirstEvent(notificationType).messageDescription
        )
        console.log('...result: ', result)
      }
    } else {
      for (let event of member.notificationEvents) {
        if (['Sent', 'Cancelled'].indexOf(event.status) < 0 && 
        notificationSchedule.schedule[0].admissionOffset <= daysSinceApplication) {
          console.log(`Matched against user: ${ event.email } with event: ${ event.notificationType}, status: ${ event.status }` )
          // Send the email
          // get the next notification message id from the schedule
          /*
          const result = await UhuruBE.sendEmail(
            member.notificationType, member.email, member.firstName, 
            schedule.getNextEvent(member.notificationType).messageID,
            schedule.getNextEvent(member.notificationType).messageDescription
          )
          */
          console.log('...result: ', result)
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