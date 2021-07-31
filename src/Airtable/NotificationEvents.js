import Airtable from 'airtable'

// Add a new event
const addEvent = async (email, notificationType, statusDate, status, messageID, messageDescription) => {
  return new Promise(async (resolve, reject) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE)
    base('Notification Events').create([
      {
        "fields": {
          "Email": email,
          "Notification type": notificationType,
          "Message ID": messageID,
          "Message description": messageDescription,
          "Status date": statusDate,
          "Status": status,
      }
    }], (err, records) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(records[0].id)
    })
  })
}

// Retrieve matching events from the Notification Events table
const getEventsForMember = async (email, notificationType) => {
  return new Promise(async (resolve, reject) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)

    const filter = "AND(" + 
      "{Email} = \"" + email + "\", " +
      "{Notification Type} = \"" + notificationType + "\" " +
    ")"

    base('Notification Events').select({ 
      filterByFormula: filter,
      view: 'Notification Events' 
    })
    .firstPage((err, records) => {
      if (err) { 
        console.error('filter: ', filter)
        console.error(err) 
        reject(err) 
      }

      // Return the number of matching events that haven't been sent from the
      // Notification Events table
      let notificationEvents = []
      for (let record of records) {
        notificationEvents.push({ 
          email: `${ record.fields.Email }`, 
          notificationType: `${ record.fields['Notification type'] }`, 
          statusDate: `${ record.fields['Status date'] }`, 
          status: `${ record.fields.Status }`, 
          messageID: `${ record.fields['Message ID'] }`,
          messageDescription: `${ record.fields['Message description'] }`
        })
      }
      resolve(notificationEvents)
    })
  })
}

export { addEvent, getEventsForMember }