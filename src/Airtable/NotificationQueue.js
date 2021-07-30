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
      for (let i = 0; i < records.length; ++i) {
        if (records.length > 0) {
          const notificationEvents = await getEventsForMember(records[i].fields.Email, records[i].fields['Notification type'])
          notificationQueue.push({
            email: `${ records[i].fields.Email }`, 
            notificationType: `${ records[i].fields['Notification type'] }`, 
            notificationEventCount: `${ records[i].fields['Count (Notification Events Link)']}`,
            notificationEvents: notificationEvents
          })
        }
      }
      resolve(notificationQueue)
    })
  })
}

export { getEligibleMembers }