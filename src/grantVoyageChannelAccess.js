import Discord from './Discord.js'
import FileOps from './FileOps.js'

const grantVoyageChannelAccess = async (environment, DISCORD_TOKEN, TEAMS) => {
  const discordIntf = new Discord(environment)
  const rawTeams = FileOps.readFile(TEAMS)
  const teams = JSON.parse(rawTeams)
  console.log(teams)

  const client = discordIntf.getDiscordClient()
  try {
    client.on('ready', async () => {
      // Authorize voyager access to the Voyage channels
      console.log('\nConnected as ' + client.user.tag)

      const channels = client.channels.cache.array()
      const guild = channels[0].guild

      const categoryName = discordIntf.generateCategoryName(teams)
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      if (category.length === 0) {
        throw new Error(`This Voyage category (${ categoryName }) hasn't been \
          defined yet. Please create it before continuing.`)
        process.exit(1)
      }

      // Authorize teammember access to the team channels
      for (let team of teams.teams) {
        let channel = discordIntf.isChannelCreated(guild, team.team.name)
        if (channel.length === 0) {
          throw new Error(`This team channel (${ team.team.name }) hasn't been \
          defined yet. Please create it before continuing.`)
        }
        // TODO: Authorize access to the channel
        //await channel.createOverwrite(,,'Grant access to team member')
      }

      discordIntf.authorizeResolve('done')
    })
  }
  catch(err) {
    console.log(err)
    await client.destroy() // Terminate this Discord bot
    discordIntf.authorizeReject('fail')
  }

  // Login to Discord
  try {
    await client.login(DISCORD_TOKEN)
    console.log('Successful Discord login')
    return discordIntf.authorizePromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
    console.error(err)
    discordIntf.authorizeReject('fail')
  }
}

export default grantVoyageChannelAccess