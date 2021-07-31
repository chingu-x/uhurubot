import dotenv from 'dotenv'

export default class UhuruBE {
  async sendEmail(notificationType, email, name, messageID, messageDescription) {
    return new Promise(async (resolve, reject) => {
      let response = await fetch('https://uhurube.herokuapp.com/messagemanager', {
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
      console.log(`Result status: ${ response.status } - ${ response.statusText }`)
      
      if (response.status === 200) {
        // Create a Notification Event row for the first notification of this type
        const now = new Date()
        const recordID = await addEvent(email, notificationType, 
          now.toISOString.slice(0,10), 'Sent', 
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

}
