import Airtable from 'airtable'

// Retrieve all voyagers for a specific Voyage
const getVoyageTeam = async (voyage) => {
  return new Promise(async (resolve, reject) => {
    let voyagers = []

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)

    const filter = "AND(" +
      "{Voyage} = \"" + voyage + "\", " +
      "{Team No.} != BLANK()" +
      ")"

    console.log('getVoyageTeam - filter: ', filter)

    base('Voyage Signups').select({ 
      fields:['Email', 'Voyage', 'Team Name', 'Tier', 'Discord ID', 'GitHub ID'],
      filterByFormula: filter,
      view: 'Teamsort - for Bots' 
    })
    .eachPage(function page(records, fetchNextPage) {
      // Return the number of matching events that haven't been sent from the
      // Notification Events table
      let voyagerNo = 0
      for (let record of records) {
        voyagerNo = ++voyagerNo
        voyagers.push({ 
          number: `${ voyagerNo }`,
          email: `${ record.get('Email') }`,
          voyage: `${ record.get('Voyage') }`,
          team_name: `${ record.get('Team Name') }`,
          tier: `${ record.get('Tier') }`,
          discord_name: `${ record.get('Discord ID') }`,
          github_name: `${ record.get('GitHub ID') }`,
        })
      }

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    }, function done(err) {
      if (err) { 
        console.error('filter: ', filter)
        console.error(err) 
        reject(err) 
      }
      resolve(voyagers)
    })
  })
}

export { getVoyageTeam }