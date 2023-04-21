import DiscordJS from 'discord.js'

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

  findChannel(guild, channelName) {
    // Validate category ownership if channel name is formatted as
    // 'categoryname/channelname'
    const indexOfSlash = channelName.indexOf('/')
    const categoryName = indexOfSlash >= 0 ? channelName.substring(0,indexOfSlash) : ''
    const realChannelName = indexOfSlash >= 0 ? channelName.substring(indexOfSlash + 1) : channelName
    const channel = guild.channels.cache.find(channel => channel.name === realChannelName)
    let category = guild.channels.cache.find(category => 
      category.id === channel.parentID && category.type === 'category' && category.name === categoryName)
    if (category.length === 0) {
      return null
    }  
    return channel
  }

  getDiscordClient() {
    return this.client
  }

  isCategoryCreated(guild, categoryName) {
    return guild.channels.cache.array()
      .filter((channel) => {
        return channel.type === 'category' && channel.name === categoryName
      })
  }

  async createChannelCategory(guild, categoryName) {
    const category = await guild.channels.create(categoryName, {
      type: 'category',
      topic: `${ categoryName }`,
      position: 1,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: ['MANAGE_MESSAGES'],
          deny: ['VIEW_CHANNEL'],
        }]
    })
    return category
  }

  isChannelCreated(guild, categoryName = '', channelName) {
    const channel = guild.channels.cache.array()
      .filter(channel => channel.name === channelName)
    
    // Validate that channel is owned by a category based on an optional category name parm
    if (categoryName !== '') {
      let category = this.isCategoryCreated(guild, categoryName)
      return category.length > 0 && category[0].name === categoryName ? channel : []
    }
    return channel
  }

  async postGreetingMessage(channel, greetingMessageText) {
    await channel.send(greetingMessageText)
  }

  async createChannel(guild, categoryId, channelType, teamName) {
    const channel = await guild.channels.create(teamName, {
      type: `${ channelType }`,
      topic: `${ teamName }`,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
      ],
    })
    return channel
  }

}