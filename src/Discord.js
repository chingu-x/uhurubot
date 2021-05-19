const DiscordJS = require('discord.js')
const FileOps = require('./FileOps')

class Discord {
  constructor(environment) {
    this.environment = environment
    this.isDebug = this.environment.isDebug()

    // Since extraction occurs within the `client.on` block these promises are
    // returned to the extract/audit callers and resolved by calling 
    // `this.xxxxxxResolve()` when functions like `createVoyageChannels()` 
    // have completed.
    this.createResolve = null
    this.createReject = null
    this.createPromise = new Promise((resolve, reject) => {
      this.createResolve = resolve
      this.createReject = reject
    })

    this.authorizeResolve = null
    this.authorizeReject = null
    this.authorizePromise = new Promise((resolve, reject) => {
      this.authorizeResolve = resolve
      this.authorizeReject = reject
    })
  }

  generateCategoryName(teams) {
    return 'v'.concat(teams.voyage_number,'-🔥')
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

  async postGreetingMessage(channel, greetingMessageText) {
    await channel.send(greetingMessageText)
  }

  async createChannel(guild, category, teamName) {
    const channel = await guild.channels.create(teamName, {
      type: 'text',
      parent: category,
      permissionOverwrites: [{
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

        // Create the Voyage category
        const categoryName = this.generateCategoryName(teams)
        let category = this.isCategoryCreated(guild, categoryName)
        if (category.length === 0) {
          category = await this.createChannelCategory(guild, categoryName)
        }

        // Create Shared Channels
        for (let sharedChannel of teams.shared_channels) {
          let channel = this.isChannelCreated(guild, sharedChannel.channel_name)
          if (channel.length === 0) {
            channel = await this.createChannel(guild, category, sharedChannel.channel_name)
            this.postGreetingMessage(channel, sharedChannel.greeting)
          }
        }

        // Create & populate team channels
        for (let team of teams.teams) {
          let channel = this.isChannelCreated(guild, team.team.name)
          if (channel.length === 0) {
            channel = await this.createChannel(guild, category, team.team.name)
            await this.postGreetingMessage(channel, teams.team_greeting)
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

  async grantVoyageChannelAccess(DISCORD_TOKEN, TEAMS) {
    const rawTeams = FileOps.readFile(TEAMS)
    const teams = JSON.parse(rawTeams)
    console.log(teams)

    const client = new DiscordJS.Client()
    try {
      client.on('ready', async () => {
        // Authorize voyager access to the Voyage channels
        console.log('\nConnected as ' + client.user.tag)

        const channels = client.channels.cache.array()
        const guild = channels[0].guild

        const categoryName = this.generateCategoryName(teams)
        let category = this.isCategoryCreated(guild, categoryName)
        if (category.length === 0) {
          throw new Error(`This Voyage category (${ categoryName }) hasn't been \
            defined yet. Please create it before continuing.`)
          process.exit(1)
        }

        // Authorize teammember access to the team channels
        for (let team of teams.teams) {
          let channel = this.isChannelCreated(guild, team.team.name)
          if (channel.length === 0) {
            throw new Error(`This team channel (${ team.team.name }) hasn't been \
            defined yet. Please create it before continuing.`)
          }
          // TODO: Authorize access to the channel
          //await channel.createOverwrite(,,'Grant access to team member')
        }

        this.authorizeResolve('done')
      })
    }
    catch(err) {
      console.log(err)
      await client.destroy() // Terminate this Discord bot
      this.authorizeReject('fail')
    }

    // Login to Discord
    try {
      await client.login(DISCORD_TOKEN)
      console.log('Successful Discord login')
      return this.authorizePromise
    }
    catch (err) {
      console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
      console.error(err)
      this.authorizeReject('fail')
    }
  }

}

module.exports = Discord