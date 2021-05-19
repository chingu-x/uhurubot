import Discord from './Discord.js'
import FileOps from './FileOps.js'

const createVoyageChannels = async (environment, DISCORD_TOKEN, TEAMS) => {
  const discordIntf = new Discord(environment)
  const rawTeams = FileOps.readFile(TEAMS)
  const teams = JSON.parse(rawTeams)
  console.log(teams)

  const client = discordIntf.getDiscordClient()
  try {
    client.on('ready', async () => {
      // Create the Voyage channels
      console.log('\nConnected as ' + client.user.tag)

      const channels = client.channels.cache.array()
      const guild = channels[0].guild

      // Create the Voyage category
      const categoryName = discordIntf.generateCategoryName(teams)
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      if (category.length === 0) {
        category = await discordIntf.createChannelCategory(guild, categoryName)
      }

      // Create Shared Channels
      for (let sharedChannel of teams.shared_channels) {
        let channel = discordIntf.isChannelCreated(guild, sharedChannel.channel_name)
        if (channel.length === 0) {
          channel = await discordIntf.createChannel(guild, category, sharedChannel.channel_name)
          discordIntf.postGreetingMessage(channel, sharedChannel.greeting)
        }
      }

      // Create & populate team channels
      for (let team of teams.teams) {
        let channel = discordIntf.isChannelCreated(guild, team.team.name)
        if (channel.length === 0) {
          channel = await discordIntf.createChannel(guild, category, team.team.name)
          await discordIntf.postGreetingMessage(channel, teams.team_greeting)
        }
      }

      discordIntf.createResolve('done')
    })
  }
  catch(err) {
    console.log(err)
    await client.destroy() // Terminate this Discord bot
    discordIntf.createReject('fail')
  }

  // Login to Discord
  try {
    await client.login(DISCORD_TOKEN)
    console.log('Successful Discord login')
    return discordIntf.createPromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
    console.error(err)
    discordIntf.createReject('fail')
  }
}

export default createVoyageChannels