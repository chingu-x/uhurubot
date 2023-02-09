import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'
// import initializeProgressBars from './util/initializeProgressBars.js'

const grantVoyageChannelAccess = async (environment, DISCORD_TOKEN, TEAMS_FILE_NAME, VALIDATE) => {
          
  // TODO: Add verification of the parent category when a match is made on the channel name to ensure we have the right one
  const getChannel = (guild, category, teamName) => {
    console.log('getChannel - category.name: ', category.name, ' category.id: ', category.id, ' teamName: ', teamName)
    const channel = guild.channels.cache.find(channel => {
      console.log('getChannel find - channel.name: ', channel.name, 'channel.parentID: ', channel.parentID)
      return channel.name === teamName && channel.parentID === category.id
    })
    return channel
  }

  const grantUserAccess = async (type, guild, channel, team) => {
    console.log('grantUserAccess - type: ', type, ' team: ', team, ' channel: ', channel)
    const allUsers = await guild.members.fetch()
    
    for (let userID of team.team.discord_names) {
      const userName = userID.split('#')[0]
      const user = allUsers.find(member => {
          return member.user.username === userName || member.nickname === userName
        }
      )

      if (VALIDATE) {
        if (!user || user.size === 0) {
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
        console.log(`channel.name: ${ channel.name } user: ${ userName }`)
        console.log('...permissions: ', permissions)
        const updatedChannel = await channel.updateOverwrite(user, permissions)
        console.log('updatedChannel: ', updatedChannel.name)
      }
    }
  }

  const discordIntf = new Discord(environment)
  const rawTeams = FileOps.readFile(TEAMS_FILE_NAME)
  const teamsConfig = JSON.parse(rawTeams)
  
  //const ALL_TEAMS = 0
  const teamNames = teamsConfig.teams.map(team => team.team.name)
  //let { overallProgress, progressBars } = initializeProgressBars(teamNames)

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(`${ process.env.GUILD_ID }`)

  try {
    client.on('ready', async () => {
      // Authorize voyagers access to their Voyage channels
      const categoryName = discordIntf.generateCategoryName(teamsConfig)
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      console.log('grantVoyageChannelAccess - category: ', category[0])
      if (category.length === 0) {
        throw new Error(`This Voyage category (${ categoryName }) hasn't been \
          defined yet. Please create it before continuing.`)
      }

      // Authorize teammember access to the team channels
      let teamNo = 0
      for (let team of teamsConfig.teams) {
        console.log('...team: ', team)
        if (team.team.discord_names.length > 0) {
          let textChannel = getChannel(guild, category[0], team.team.name)
          await grantUserAccess('text', guild, textChannel, team)
          let voiceChannel = getChannel(guild, category[0], team.team.name.concat('av'))
          await grantUserAccess('voice', guild, voiceChannel, team)
        }
        //progressBars[teamNo+1].increment(1)
        //progressBars[ALL_TEAMS].increment(1) 
        //++teamNo 
      }

      //overallProgress.stop()
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