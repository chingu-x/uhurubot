import { sendEmail } from './util/UhuruBE.js'
import { getEligibleMembers } from './Airtable/NotificationQueue.js'

// Using the current date, calculate for each member how many days have 
// elapsed since their application was approved & which email should be sent
// based on the schedule.
const isMessageEligibleToSend = (applicationApprovalDate, messageOffsetInDays) => {
  const oneDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const approvalDate = new Date(applicationApprovalDate)
  let daysSinceApplication = Math.floor((now.getTime() - approvalDate.getTime()) / oneDay)
  console.log(`now: ${ now.toISOString() }`)
  console.log(`approvalDate: ${ approvalDate.toISOString() }`)
  console.log(`daysSinceApplication: ${ daysSinceApplication }`)

  return (messageOffsetInDays <= daysSinceApplication ? true : false)
}

const emailScheduledMessages = async (environment, schedule) => {
  const notificationSchedule = schedule.getSchedule()
  //console.log('schedule: ', notificationSchedule)

  // Scan Notification Queue table to identify members where at least one
  // email remains to be sent and have not:
  // 1. Unsubscribed from emails
  // 2. Submitted a Solo Project
  // 3. Become an inactive member
  let eligibleMembers = await getEligibleMembers()
  //console.log('eligibleMembers: ', eligibleMembers)

  for (let member of eligibleMembers) {
    console.log('member: ', member)

    if (member.notificationEvents.length === 0) {
      // If the user has no events recorded add the first event for this application
      // notification type
      if (['Sent', 'Cancelled'].indexOf(member.notificationEvents.status) < 0 &&
          isMessageEligibleToSend(member.applicationApprovalDate, notificationSchedule.events[0].admissionOffset)) {
        console.log(`Matched against user ${ member.email } with no events`)
        const result = await sendEmail(
          environment, member.notificationType, member.email, member.firstName, 
          schedule.getFirstEvent(member.notificationType).messageID,
          schedule.getFirstEvent(member.notificationType).messageDescription
        )
        console.log('...result: ', result)
      }
    } else {
      // If prior events exist for the user for this notification type use the
      // the last one completed to determine what the next event in the event
      // sequence is so it can be added.
      for (let event of member.notificationEvents) {
        // TBD: Match against event status from Notification Events, NOT Notification Queue
        if (['Sent', 'Cancelled'].indexOf(member.notificationEvents.status) < 0 &&
            isMessageEligibleToSend(member.applicationApprovalDate, notificationSchedule.events[0].admissionOffset)) {
          console.log(`Matched against user: ${ event.email } with event: ${ event.notificationType}, status: ${ event.status }` )
          const nextEvent = schedule.getNextEvent(event.notificationType, event.messageID)
          console.log('nextEvent: ', nextEvent)
          if (['Sent', 'Cancelled'].indexOf(member.notificationEvents.status) < 0 && 
              isMessageEligibleToSend(member.applicationApprovalDate, nextEvent.admissionOffset)) {
            // Send the email
            const result = await sendEmail(
              environment, member.notificationType, member.email, member.firstName, 
              nextEvent.messageID, nextEvent.messageDescription
            )
            console.log('...result: ', result)
            break
          }
        }
      }
    }

    // TBD: If the last email for this notification type has been sent update the
    // Notification Queue table to mark the notification as finished.

  }


}

export default emailScheduledMessages