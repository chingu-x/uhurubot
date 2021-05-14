const DiscordJS = require('discord.js')
const FileOps = require('./FileOps')

class Discord {
  constructor(environment) {
    this.environment = environment
    this.isDebug = this.environment.isDebug()

    // Since extraction occurs within the `client.on` block these promises are
    // returned to the extract/audit callers and resolved by calling 
    // `this.createResolve()` when `createVoyageChannels()` has completed.
    this.createResolve = null
    this.createReject = null
    this.createPromise = new Promise((resolve, reject) => {
      this.createResolve = resolve
      this.createReject = reject
    })
  }

  isCategoryCreated(guild, categoryName) {
    return guild.channels.cache.array()
      .filter(channel => channel.type === 'category' && channel.name === categoryName)
  }

  async createChannelCategory(guild, categoryName) {
    const category = await guild.channels.create(categoryName, {
      type: 'category',
      position: 1,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: ['VIEW_CHANNEL'],
        }]
    })
    console.log('Category created - ', category.name)
    return category
  }

  isChannelCreated(guild, teamName) {
    return guild.channels.cache.array()
      .filter(channel => channel.type === 'text' && channel.name === teamName)
  }

  async createChannel(guild, category, teamName) {
    const channel = await guild.channels.create(teamName, {
      type: 'text',
      parent: category,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: ['VIEW_CHANNEL'],
        }]
    })
    console.log('Channel created - ', channel.name)
    return channel
  }

  async createVoyageChannels(DISCORD_TOKEN, TEAMS) {
    const rawTeams = FileOps.readFile(TEAMS)
    const teams = JSON.parse(rawTeams)
    console.log(teams)

    const client = new DiscordJS.Client()
    try {
      client.on('ready', async () => {
        // Create the Voyage channels
        console.log('\nConnected as ' + client.user.tag)

        const channels = client.channels.cache.array()
        const guild = channels[0].guild
        console.log('guild.categories: ', guild.channels.cache.array()
          .filter(channel => channel.type === 'category'))

        const categoryName = 'v'.concat(teams.voyage_number,'-🔥')
        let category = this.isCategoryCreated(guild, categoryName)
        if (category.length === 0) {
          category = await this.createChannelCategory(guild, categoryName)
        }

        for (let team of teams.teams) {
          let channel = this.isChannelCreated(guild, team.team)
          if (channel.length === 0) {
            channel = await this.createChannel(guild, category, team.team)
          }
        }

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
      console.log('Successful Discord login')
      return this.createPromise
    }
    catch (err) {
      console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
      console.error(err)
      this.createReject('fail')
    }
  }

  grantVoyageChannelAccess() {
    // Add code here
  }

}

module.exports = Discord