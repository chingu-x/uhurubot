import Discord from './Discord.js'
import FileOps from './FileOps.js'
import initializeProgressBars from './initializeProgressBars.js'

const grantVoyageChannelAccess = async (environment, GUILD_ID, DISCORD_TOKEN, TEAMS, VALIDATE) => {
  
  const getChannel = (discordIntf, guild, categoryName, teamName) => {
    let channel = discordIntf.isChannelCreated(guild, categoryName, teamName)
    if (channel.length === 0) {
      throw new Error(`This channel (${ teamName }) hasn't been \
defined yet. Please create it before continuing.`)
    }
    return channel[0]
  }

  const grantUserAccess = async (type, guild, channel, team) => {
    const allUsers = await guild.members.fetch()
    
    for (let userName of team.team.discord_names) {
      const user = allUsers.find(member => 
        member.user.username === userName || member.nickname === userName
      )
      if (VALIDATE) {
        if (user.size === 0) {
          console.log('Validation failed for user: ', userName)
        }
      } else {
        const permissions = type === 'text'
          ? {
              'VIEW_CHANNEL': true,
              'SEND_MESSAGES': true,
              'EMBED_LINKS': true,
              'ATTACH_FILES': true,
              'ADD_REACTIONS': true,
              'MENTION_EVERYONE': true,
              'MANAGE_MESSAGES': true,
              'READ_MESSAGE_HISTORY': true
            }
          : {
              'VIEW_CHANNEL': true,
              'STREAM': true,
              'CONNECT': true,
              'SPEAK': true,
            }
        // TODO: Add error handling & reporting for unknown users
        //console.log(`channel.name: ${ channel.name } user: ${ userName }`)
        const updatedChannel = await channel.updateOverwrite(user, permissions)
      }
    }
  }
  const discordIntf = new Discord(environment)
  const rawTeams = FileOps.readFile(TEAMS)
  const teams = JSON.parse(rawTeams)
  
  const ALL_TEAMS = 0
  const teamNames = teams.teams.map(team => team.team.name)
  let { overallProgress, progressBars } = initializeProgressBars(teamNames, { includeCategory: false, includeDetailBars: true })

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(`${ process.env.GUILD_ID }`)

  try {
    client.on('ready', async () => {
      // Authorize voyagers access to their Voyage channels
      const categoryName = discordIntf.generateCategoryName(teams)
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      if (category.length === 0) {
        throw new Error(`This Voyage category (${ categoryName }) hasn't been \
          defined yet. Please create it before continuing.`)
      }

      // Authorize teammember access to the team channels
      let teamNo = 0
      for (let team of teams.teams) {
        if (team.team.discord_names.length > 0) {
          let textChannel = getChannel(discordIntf, guild, categoryName, team.team.name)
          await grantUserAccess('text', guild, textChannel, team)
          let voiceChannel = getChannel(discordIntf, guild, categoryName, team.team.name.concat('av'))
          grantUserAccess('voice', guild, voiceChannel, team)
        }
        progressBars[teamNo+1].increment(1)
        progressBars[ALL_TEAMS].increment(1) 
        ++teamNo 
      }

      overallProgress.stop()
      discordIntf.commandResolve('done')
    })
  }
  catch(err) {
    console.log(err)
    await client.destroy() // Terminate this Discord bot
    discordIntf.commandReject('fail')
    process.exit(1)
  }

  // Login to Discord
  try {
    await client.login(DISCORD_TOKEN)
    return discordIntf.commandPromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
    console.error(err)
    discordIntf.commandReject('fail')
    process.exit(1)
  }
}

export default grantVoyageChannelAccess