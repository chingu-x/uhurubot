import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'
import initializeProgressBars from './util/initializeProgressBars.js'

const lookupDiscordCategory = (categoryNames, categoryName) => {
  const category = categoryNames.find(category => category.name === categoryName)
  return category
}

const createVoyageChannels = async (environment, GUILD_ID, DISCORD_TOKEN, TEAMS_FILE_NAME) => {
  const discordIntf = new Discord(environment)

  // Load the teams configuration file into a JS object
  const rawTeamsConfig = FileOps.readFile(TEAMS_FILE_NAME)
  const teamsConfig = JSON.parse(rawTeamsConfig)
  console.log('teamsConfig: ', teamsConfig)

  const categoryNames = teamsConfig.categories.map(category => {
    return { 
      "name": category, 
      "created": false,
      "discordCategory": null,
    }
  })

  console.log('categoryNames: ', categoryNames)

  let categoryNoForProgressBar = 0
  let { overallProgress, progressBars } = initializeProgressBars(categoryNames)

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(GUILD_ID)

  try {
    client.on('ready', async () => {

      // Create the Voyage category
      for (let i = 0; i < categoryNames.length; i++) {
        let discordCategory = discordIntf.isCategoryCreated(guild, categoryNames[i].name)
        if (discordCategory.length === 0) {
          discordCategory = await discordIntf.createChannelCategory(guild, categoryNames[i].name)
          categoryNames[i].discordCategory = discordCategory
        }
      }

      // Create & populate team channels
      for (let team of teamsConfig.teams) {
        let discordChannel = discordIntf.isChannelCreated(guild, team.team.name)
        let discordCategory = lookupDiscordCategory(categoryNames, team.team.category)
        if (discordCategory === undefined) {
          console.log('categoryNames: ', categoryNames)
          console.log('team.team:', team.team)
          throw new Error(`Category name '${ team.team.category }' is undefined in the configuration.`)
        }
        if (discordChannel.length === 0) {
          discordChannel = await discordIntf.createChannel(guild, discordCategory.discordCategory.id, 'GUILD_TEXT', team.team.name)
          const voiceChannel = await discordIntf.createChannel(guild, discordCategory.discordCategory.id, 'GUILD_VOICE', team.team.name.concat('av'))
          await discordIntf.postGreetingMessage(discordChannel, teamsConfig.team_greeting)

          // Add a tier-specific greeting message if one is configured for this team's tier
          if (teamsConfig.tier_greeting !== undefined) {
            for (let i = 0; i < teamsConfig.tier_greeting.length; ++i) {
              if (teamsConfig.tier_greeting[i].tier === team.team.tier) {
                await discordIntf.postGreetingMessage(discordChannel, teamsConfig.tier_greeting[i].greeting)
              }
            }
          }
        }

        //progressBars[categoryNoForProgressBar].increment(1)
        //++categoryNoForProgressBar
      }

      overallProgress.stop()
      discordIntf.commandResolve('done')
    })
  }
  catch(err) {
    console.log(err)
    overallProgress.stop()
    await client.destroy() // Terminate this Discord bot
    discordIntf.commandReject('fail')
  }

  // Login to Discord
  try {
    await client.login(DISCORD_TOKEN)
    return discordIntf.commandPromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ process.env.DISCORD_TOKEN }`)
    console.error(err)
    overallProgress.stop()
    discordIntf.commandReject('fail')
  }
}

export default createVoyageChannels