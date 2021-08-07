import fetch from 'node-fetch'
import { addEvent } from '../Airtable/NotificationEvents.js'

  const sendEmail = async (environment, notificationType, email, name, messageID, messageDescription) => {
    return new Promise(async (resolve, reject) => {
      const { UHURUBE_URL } = environment.getOperationalVars()
      let response = await fetch(UHURUBE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "messageType": messageID,
          "toEmail": `${ email }`,
          "toName": `${ name }`
        })
      });
      console.log(`UHURUBE_URL: ${ UHURUBE_URL } Result status: ${ response.status } - ${ response.statusText }`)
      
      if (response.status === 200) {
        // Create a Notification Event row for the first notification of this type
        const now = new Date()
        const recordID = await addEvent(email, notificationType, 
          now.toISOString().slice(0,10), 'Sent', 
          messageID,
          messageDescription)
        resolve(recordID)
      } else {
        reject({
          "errorStatus": `${ response.status }`,
          "errorText": `${ response.statusText }`
        })
      }
    })
  }

export { sendEmail }
