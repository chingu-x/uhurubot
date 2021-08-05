import Airtable from 'airtable'
import { getEventsForMember } from './NotificationEvents.js'

// Retrieve the eligible members from the Notification Queue who meet the
// selection criteria
const getEligibleMembers = async () => {
  return new Promise(async (resolve, reject) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)

    const filter = "AND(" + 
      "{Status} = \"In-progress\", " +
      "{Subscription Status (from Applications)} = \"Active\", " +
      "{Evaluation Status (from Solo Projects)} = \"\" " +
    ")"

    base('Notification Queue').select({ 
      filterByFormula: filter,
      view: 'Notification Queue' 
    })
    .firstPage(async (err, records) => {
      if (err) { 
        console.error('filter: ', filter)
        console.error(err) 
        reject(err) 
      }

      // Return the number of matching events that haven't been sent from the
      // Notification Events table
      let notificationQueue = []
      for (let record of records) {
        const notificationEvents = await getEventsForMember(record.fields.Email, record.fields['Notification type'])
        notificationQueue.push({
          recordID: record.id,
          email: `${ record.fields.Email }`, 
          notificationType: `${ record.fields['Notification type'] }`, 
          status: `${ record.fields.Status }`,
          notificationEventCount: `${ record.fields['Count (Notification Events Link)'] }`,
          applicationApprovalDate: `${ record.fields['Timestamp (from Applications)'].toString().slice(0,10) }`,
          firstName: `${ record.fields['First name (from Applications)'] }`,
          notificationEvents: notificationEvents
        })
      }
      resolve(notificationQueue)
    })
  })
}

const updateQueueStatus = async (recordID, newStatus) => {
  return new Promise(async (resolve, reject) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)

    base('Notification Queue').update([
      {
        "id": recordID,
        "fields": {
          status: `${ newStatus }`,
        }
      }
    ], (err, records) => {
      if (err) {
        console.error('Error:', err)
        reject(err)
      }
      resolve(records[0].id)
    })
  })
}

export { getEligibleMembers, updateQueueStatus }