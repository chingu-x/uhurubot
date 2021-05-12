const DiscordJS = require('discord.js')
const FileOps = require('./FileOps')

class Discord {
  constructor(environment) {
    this.environment = environment
    this.isDebug = this.environment.isDebug()

    // Since extraction occurs within the `client.on` block these promises are
    // returned to the extract/audit callers and resolved by calling 
    // `this.xxxxxxResolve()` when `createVoyageChannels()` has completed.
    this.createResolve = null
    this.createReject = null
    this.createPromise = new Promise((resolve, reject) => {
      this.createResolve = resolve
      this.createReject = reject
    })

  }

  async createVoyageChannels(DISCORD_TOKEN, VOYAGE, TEAMS) {
    const rawTeamData = FileOps.readFile(TEAMS)
    const jsonTeamData = JSON.parse(rawTeamData)
    console.log(jsonTeamData)
    console.log(jsonTeamData.voyage_number)

    const client = new DiscordJS.Client()
    try {
      client.on('ready', async () => {
        // Create the Voyage channels
        console.log('\nConnected as ' + client.user.tag)
        this.createResolve('done')
      })
    }
    catch(err) {
      console.log(err)
      await client.destroy() // Terminate this Discord bot
      this.createReject('fail')
    }

    // Login to Discord
    try {
      await client.login(DISCORD_TOKEN)
      return this.createPromise
    }
    catch (err) {
      console.error(`Error logging into Discord. Token: ${process.env.DISCORD_TOKEN}`)
      console.error(err)
      this.createReject('fail')
    }
  }

  grantVoyageChannelAccess() {
    
  }

}

module.exports = Discord