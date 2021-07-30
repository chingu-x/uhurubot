import Airtable from 'airtable'

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
      for (let i = 0; i < records.length; ++i) {
        if (records.length > 0) {
          console.log(records[i])
        }
      }
      resolve(null)
    })
  })
}

export { getEventsForMember }