import Discord from './Discord.js'
import FileOps from './FileOps.js'
import initializeProgressBars from './initializeProgressBars.js'

const grantVoyageChannelAccess = async (environment, DISCORD_TOKEN, TEAMS) => {
  const discordIntf = new Discord(environment)
  const rawTeams = FileOps.readFile(TEAMS)
  const teams = JSON.parse(rawTeams)
  
  const ALL_TEAMS = 0
  const CATEGORY_NO = 1
  const teamNames = teams.teams.map(team => team.team.name)
  let { overallProgress, progressBars } = initializeProgressBars(teamNames, { includeCategory: false })


  const client = discordIntf.getDiscordClient()
  try {
    client.on('ready', async () => {
      // Authorize voyager access to the Voyage channels
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
      let teamNo = 0
      for (let team of teams.teams) {
        let channel = discordIntf.isChannelCreated(guild, team.team.name)
        if (channel.length === 0) {
          throw new Error(`This team channel (${ team.team.name }) hasn't been \
          defined yet. Please create it before continuing.`)
        }
        // Authorize access to the channel
        if (team.team.discord_names.length > 0) {
          for (let userName of team.team.discord_names) {
            const user = await guild.members.fetch({ query: `${ userName }`, limit: 1 })
            await channel[0].updateOverwrite(user.first().user,
              {
                'VIEW_CHANNEL': true,
                'SEND_MESSAGES': true,
                'EMBED_LINKS': true,
                'ATTACH_FILES': true,
              }
            )
          }
        }
        progressBars[teamNo+1].increment(1)
        progressBars[ALL_TEAMS].increment(1) 
        ++teamNo 
      }

      overallProgress.stop()
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
    return discordIntf.authorizePromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
    console.error(err)
    discordIntf.authorizeReject('fail')
  }
}

export default grantVoyageChannelAccess