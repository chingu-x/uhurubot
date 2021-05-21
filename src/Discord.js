import DiscordJS from 'discord.js'
import FileOps from './FileOps.js'

export default class Discord {
  constructor(environment) {
    this.environment = environment
    this.isDebug = this.environment.isDebug()
    this.client = new DiscordJS.Client()

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

  getDiscordClient() {
    return this.client
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
          deny: ['VIEW_CHANNEL'],
        }]
    })
    return channel
  }

}