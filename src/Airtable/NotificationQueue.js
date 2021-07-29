import Airtable from 'airtable'

// Retrieve the number of Applications for the matching starting & ending 
// date range
const getEligibleChingus = async () => {
  return new Promise(async (resolve, reject) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)

    const filter = "AND(" + 
        "IS_AFTER({Timestamp},DATETIME_PARSE(\"" + metricStartDate.slice(0,10) + "\",\"YYYY-MM-DD\")), " +
        "IS_BEFORE({Timestamp},DATETIME_PARSE(\"" + metricEndDate.slice(0,10) + "\",\"YYYY-MM-DD\")) " +  
      ")"

    base('Notification Queue').select({ 
      filterByFormula: filter,
      view: 'Notification Queue' 
    })
    .firstPage((err, records) => {
      if (err) { 
        console.error('filter: ', filter)
        console.error(err) 
        reject(err) 
      }

      // Return the number of Applications submitted in this date range
      if (records !== null && records !== undefined) {
        console.log(`records.length: `, records.length)
        resolve(records.length)
      }
      resolve(0)
    })
  })
}

export { getApplicationCountByDate }