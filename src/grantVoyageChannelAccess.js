import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'

// import initializeProgressBars from './util/initializeProgressBars.js'

const grantVoyageChannelAccess = async (environment, DISCORD_TOKEN, TEAMS_FILE_NAME, VALIDATE) => {

  // Retrieve a reference to the named category
  const lookupDiscordCategory = (categoryNames, categoryName) => {
    const category = categoryNames.find(category => category.name === categoryName)
    return category
  }
          
  // TODO: Add verification of the parent category when a match is made on the channel name to ensure we have the right one
  const getChannel = (guild, category, teamName) => {
    const channel = guild.channels.cache.find(channel => {
      return channel.name === teamName && channel.parentId === category.discordCategory.id
    })
    return channel
  }

  const grantUserAccess = async (type, guild, channel, team) => {
    const allUsers = await guild.members.fetch()

    for (let userId of team.team.discord_names) {
      const user = allUsers.find(member => {
          return member.user.id === userId
        }
      )

      if (VALIDATE) {
        if (!user || user.size === 0) {
          console.log('Validation failed for user: ', userId)
        }
      } else {
        const permissions = {
          ViewChannel: true,
          SendMessages: true,
          CreatePublicThreads: true,
          SendMessagesInThreads: true,
          EmbedLinks: true,
          AttachFiles: true,
          AddReactions: true,
          MentionEveryone: true,
          ManageMessages: true,
          ReadMessageHistory: true
        }
        
        // TODO: Add error handling & reporting for unknown users
        const updatedChannel = await channel.permissionOverwrites.edit(userId, permissions)
        console.log('Updated permissions for userId: ', userId, ' in channel: ', updatedChannel.name)
      }
    }
  }

  const rawTeams = FileOps.readFile(TEAMS_FILE_NAME)
  const teamsConfig = JSON.parse(rawTeams)
  
  //const ALL_TEAMS = 0
  const teamNames = teamsConfig.teams.map(team => team.team.name)
  //let { overallProgress, progressBars } = initializeProgressBars(teamNames)

  const discordIntf = new Discord(environment)
  const client = discordIntf.getDiscordClient()
  


  try {
    client.on('ready', async () => {
      // Retrieve references to the categories used to organize this Voyage's team channels
      const guild = await client.guilds.fetch(process.env.GUILD_ID)
      await guild.members.fetch()
      const categoryNames = teamsConfig.categories.map(category => {
        return { 
          "name": category, 
          "discordCategory": null,
        }
      })
      
      for (let i = 0; i < categoryNames.length; i++) {
        let discordCategory = discordIntf.isCategoryCreated(guild, categoryNames[i].name)
        if (discordCategory) {
          categoryNames[i].discordCategory = discordCategory
        } else {
          throw new Error(`This Voyage category (${ discordCategory }) hasn't been \
          defined yet. Please create it before continuing.`) 
        }
      }

      // Authorize teammember access to the team channels
      let teamNo = 0
      for (let team of teamsConfig.teams) {
        if (team.team.discord_names.length > 0) {
          const category = lookupDiscordCategory(categoryNames, team.team.category)
          let textChannel = getChannel(guild, category, team.team.name)
          if (textChannel === undefined) {
            throw new Error(`This Voyage channel (${ team.team.name }) hasn't been \
            defined yet. Please create it before continuing.`) 
          }
          await grantUserAccess('GUILD_TEXT', guild, textChannel, team)
        }
        //progressBars[teamNo+1].increment(1)
        //progressBars[ALL_TEAMS].increment(1) 
        //++teamNo 
      }

      //overallProgress.stop()
      discordIntf.commandResolve('done')
      client.destroy() // Terminate this Discord bot
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