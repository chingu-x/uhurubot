import Airtable from 'airtable'

// Retrieve all voyagers for a specific Voyage
const getVoyageTeam = async (voyage) => {
  return new Promise(async (resolve, reject) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)

    const filter = "{Voyage} = \"" + voyage + "\" "

    console.log('getVoyageTeam - filter: ', filter)

    base('Voyage Signups').select({ 
      filterByFormula: filter,
      view: 'Teamsort - for Bots' 
    })
    .firstPage((err, records) => {
      if (err) { 
        console.error('filter: ', filter)
        console.error(err) 
        reject(err) 
      }

      // Return the number of matching events that haven't been sent from the
      // Notification Events table
      let voyagers = []
      for (let record of records) {
        voyagers.push({ 
          email: `${ record.fields.Email }`,
          voyage: `${ record.fields.Voyage }` 
        })
      }

      resolve(voyagers)
    })
  })
}

export { getVoyageTeam }