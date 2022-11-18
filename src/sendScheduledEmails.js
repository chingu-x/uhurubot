import { sendEmail } from './util/UhuruBE.js'
import { getEligibleMembers, updateQueueStatus } from './Airtable/NotificationQueue.js'

// Using the current date, calculate for each member how many days have 
// elapsed since their application was approved & which email should be sent
// based on the schedule.
const isMessageEligibleToSend = (queueStatus, applicationApprovalDate, messageOffsetInDays) => {
  const oneDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const approvalDate = new Date(applicationApprovalDate)
  let daysSinceApplication = Math.floor((now.getTime() - approvalDate.getTime()) / oneDay)

  return (queueStatus.startsWith('In-progress') && messageOffsetInDays <= daysSinceApplication 
    ? true : false)
}

const emailScheduledMessages = async (environment, schedule) => {
  const notificationSchedule = schedule.getSchedule()

  // Scan Notification Queue table to identify members where at least one
  // email remains to be sent. Chingus are added to the Notification Queue 
  // by an Airtable automation script when their Chingu application is approved.
  //
  // None of the following must be true for a Chingu to be eligilbe to receive
  // an email:
  // 1. Unsubscribed from emails
  // 2. Submitted a Solo Project
  // 3. Become an inactive member
  let eligibleMembers = await getEligibleMembers()

  for (let member of eligibleMembers) {
    if (member.notificationEvents.length === 0) {
      // If the user has no events recorded add the first event for this application
      // notification type
      if (isMessageEligibleToSend(member.status, member.applicationApprovalDate, notificationSchedule.events[0].admissionOffset)) {
        console.log(`Matched against user ${ member.email } (status:${ member.status } with no events`)
        const firstEvent = schedule.getFirstEvent(member.notificationType)
        const result = await sendEmail(
          environment, member.notificationType, member.email, member.firstName, 
          firstEvent.messageID, firstEvent.messageDescription
        )
        
        // If the last email for this notification type has been sent update the
        // Notification Queue table to mark the notification as finished.
        const nextEvent = schedule.getNextEvent(member.notificationType, firstEvent.messageID)
        if (nextEvent === null) {
          await updateQueueStatus(member.recordID, 'Completed')
        }
      }
    } else {
      // If prior events exist for the user for this notification type use the
      // the last one completed to determine what the next event in the event
      // sequence is so it can be added.
      const lastEventIndex = member.notificationEvents.length - 1
      const lastEvent = member.notificationEvents[lastEventIndex]
      let nextEvent = schedule.getNextEvent(lastEvent.notificationType, lastEvent.messageID)
      if (nextEvent && typeof nextEvent === 'object' && 
          isMessageEligibleToSend(member.status, member.applicationApprovalDate, nextEvent.admissionOffset)) {
        console.log(`Matched against user ${ member.email } (status:${ member.status } with prior events`)    
        const result = await sendEmail(
          environment, member.notificationType, member.email, member.firstName, 
          nextEvent.messageID, nextEvent.messageDescription
        )
        
        // If the last email for this notification type has been sent update the
        // Notification Queue table to mark the notification as finished.
        nextEvent = schedule.getNextEvent(member.notificationType, nextEvent.messageID)
        if (nextEvent === null) {
          await updateQueueStatus(member.recordID, 'Completed')
        }
      }
    }
  }
}

export default emailScheduledMessages