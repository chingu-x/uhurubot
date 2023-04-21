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
      return channel.name === teamName && channel.parentID === category.discordCategory[0].id
    })
    return channel
  }

  const grantUserAccess = async (type, guild, channel, team) => {
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
  console.log('teamNames: ', teamNames)
  //let { overallProgress, progressBars } = initializeProgressBars(teamNames)

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(`${ process.env.GUILD_ID }`)

  try {
    client.on('ready', async () => {
      // Retrieve references to the categories used to organize this Voyage's team channels
      /*
      const categoryName = discordIntf.generateCategoryName(teamsConfig)
      let category = discordIntf.isCategoryCreated(guild, categoryName)
      console.log('grantVoyageChannelAccess - category: ', category[0])
      if (category.length === 0) {
        throw new Error(`This Voyage category (${ categoryName }) hasn't been \
          defined yet. Please create it before continuing.`)
      }
      */
      console.log('teamsConfig: ', teamsConfig)
      console.log('teamsConfig.categories: ', teamsConfig.categories)
      const categoryNames = teamsConfig.categories.map(category => {
        return { 
          "name": category, 
          "discordCategory": null,
        }
      })
      console.log('categoryNames: ', categoryNames)
      
      for (let i = 0; i < categoryNames.length; i++) {
        let discordCategory = discordIntf.isCategoryCreated(guild, categoryNames[i].name)
        console.log('discordCategory: ', discordCategory.name)
        if (discordCategory.length > 0) {
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
          let voiceChannel = getChannel(guild, category, team.team.name.concat('av'))
          if (voiceChannel === undefined) {
            throw new Error(`This Voyage channel (${ team.team.name.concate('av') }) hasn't been \
            defined yet. Please create it before continuing.`) 
          }
          await grantUserAccess('GUILD_VOICE', guild, voiceChannel, team)
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