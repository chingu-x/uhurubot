import Discord from './Discord.js'
import FileOps from './FileOps.js'
import initializeProgressBars from './initializeProgressBars.js'

const createVoyageChannels = async (environment, DISCORD_TOKEN, TEAMS) => {
  const discordIntf = new Discord(environment)
  const rawTeams = FileOps.readFile(TEAMS)
  const teams = JSON.parse(rawTeams)

  const ALL_TEAMS = 0
  const CATEGORY_NO = 1
  const teamNames = teams.teams.map(team => team.team.name)
  const categoryName = discordIntf.generateCategoryName(teams)
  teamNames.splice(0, 0, categoryName)
  let { overallProgress, progressBars } = initializeProgressBars(teamNames)

  const client = discordIntf.getDiscordClient()
  try {
    client.on('ready', async () => {
      const channels = client.channels.cache.array()
      const guild = channels[0].guild

      // Create the Voyage category
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      if (category.length === 0) {
        category = await discordIntf.createChannelCategory(guild, categoryName)
      }
      progressBars[CATEGORY_NO].increment(1)
      progressBars[ALL_TEAMS].increment(1) 

      // Create Shared Channels
      for (let sharedChannel of teams.shared_channels) {
        let channel = discordIntf.isChannelCreated(guild, sharedChannel.channel_name)
        if (channel.length === 0) {
          channel = await discordIntf.createChannel(guild, category, sharedChannel.channel_name)
          discordIntf.postGreetingMessage(channel, sharedChannel.greeting)
        }
      }

      // Create & populate team channels
      let teamNo = CATEGORY_NO
      for (let team of teams.teams) {
        let channel = discordIntf.isChannelCreated(guild, team.team.name)
        if (channel.length === 0) {
          channel = await discordIntf.createChannel(guild, category, team.team.name)
          await discordIntf.postGreetingMessage(channel, teams.team_greeting)
        }
        progressBars[teamNo+1].increment(1)
        progressBars[ALL_TEAMS].increment(1) 
        ++teamNo 
      }

      overallProgress.stop()
      discordIntf.createResolve('done')
    })
  }
  catch(err) {
    console.log(err)
    overallProgress.stop()
    await client.destroy() // Terminate this Discord bot
    discordIntf.createReject('fail')
  }

  // Login to Discord
  try {
    await client.login(DISCORD_TOKEN)
    return discordIntf.createPromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
    console.error(err)
    overallProgress.stop()
    discordIntf.createReject('fail')
  }
}

export default createVoyageChannels