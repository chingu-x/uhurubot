import DiscordJS from 'discord.js'
import FileOps from './FileOps.js'

export default class Discord {
  constructor(environment) {
    this.environment = environment
    this.isDebug = this.environment.isDebug()
    this.client = new DiscordJS.Client()

    // Since extraction occurs within the `client.on` block these promises are
    // returned to the extract/audit callers and resolved by calling 
    // `this.commandResolve()` when functions like `createVoyageChannels()` 
    // have completed.
    this.commandResolve = null
    this.commandReject = null
    this.commandPromise = new Promise((resolve, reject) => {
      this.commandResolve = resolve
      this.commandReject = reject
    })
  }

  findChannel(channelName) {
    const indexOfSlash = channelName.indexOf('/')
    const categoryName = indexOfSlash >= 0 ? channelName.substring(0,indexOfSlash) : ''
    const realChannelName = indexOfSlash >= 0 ? channelName.substring(indexOfSlash + 1) : channelName
    console.log(`categoryName: ${ categoryName } realChannelName: ${ realChannelName }`)
    // TODO: Validate category ownership if channel name is formatted as
    // 'categoryname/channelname'
    let category = this.isCategoryCreated(guild, categoryName)
    if (category.length === 0) {
      return [] // Category has not been defined
    }  
    // TBD
    return [] 
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

  isChannelCreated(guild, categoryName = '', channelName) {
    const channel = guild.channels.cache.array()
      .filter(channel => channel.type === 'text' && channel.name === channelName)
    // TODO: Validate that channel is owned by a category based on an optional category name parm
    if (categoryName !== '') {
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      return category.length > 0 && category.name === categoryName ? channel : []
    }
    return channel
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