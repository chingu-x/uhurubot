import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'

const lookupDiscordCategory = (categoryNames, categoryName) => {
  const category = categoryNames.find(category => category.name === categoryName)
  return category
}

const createVoyageChannels = async (environment, GUILD_ID, DISCORD_TOKEN, TEAMS_FILE_NAME) => {
  const discordIntf = new Discord(environment)

  // Load the teams configuration file into a JS object
  const rawTeamsConfig = FileOps.readFile(TEAMS_FILE_NAME)
  const teamsConfig = JSON.parse(rawTeamsConfig)
  const categoryNames = teamsConfig.categories.map(category => {
    return { 
      "name": category, 
      "created": false,
      "discordCategory": null,
    }
  })

  let categoryNoForProgressBar = 0

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(GUILD_ID)

  try {
    client.on('ready', async () => {

      // Create the Voyage category
      for (let i = 0; i < categoryNames.length; i++) {
        let discordCategory = discordIntf.isCategoryCreated(guild, categoryNames[i].name)
        if (discordCategory === undefined) {
          console.log(`Creating category: ${ categoryNames[i].name }`)
          discordCategory = await discordIntf.createChannelCategory(guild, categoryNames[i].name)
        }
        categoryNames[i].discordCategory = discordCategory
      }

      // Create & populate team channels
      for (let team of teamsConfig.teams) {
        console.log(`...Creating channel for team: ${ team.team.name }`)
        let discordChannel = discordIntf.isChannelCreated(guild, team.team.name)
        let discordCategory = lookupDiscordCategory(categoryNames, team.team.category)
        if (discordCategory === undefined || discordCategory === null) {
          console.log('categoryNames: ', categoryNames)
          console.log('team.team:', team.team)
          throw new Error(`Category name '${ team.team.category }' is undefined in the configuration.`)
        }
        if (discordChannel === undefined || discordChannel === null) {
          discordChannel = await discordIntf.createChannel(guild, discordCategory.discordCategory.id, team.team.name)

          if (teamsConfig.team_greeting !== undefined) {
            let teamMessage = '' 
            for (let i = 0; i < teamsConfig.team_greeting.length; ++i) {
              teamMessage = teamMessage.concat(teamsConfig.team_greeting[i])
            }
            await discordIntf.postGreetingMessage(discordChannel, teamMessage)
          }
          

          // Add a tier-specific greeting message if one is configured for this team's tier
          if (teamsConfig.tier_greeting !== undefined) {
            for (let i = 0; i < teamsConfig.tier_greeting.length; ++i) {
              if (teamsConfig.tier_greeting[i].tier === team.team.tier) {
                for (let j = 0; j < teamsConfig.tier_greeting[i].greeting.length; ++j ) {
                  await discordIntf.postGreetingMessage(discordChannel, teamsConfig.tier_greeting[i].greeting[j])
                }
              } 
            }
          }

          // Post a list of team members by their roles
          if (team.team.resource_msg !== undefined) {
            for (let i = 0; i < team.team.resource_msg.length; ++i) {
              await discordIntf.postGreetingMessage(discordChannel, team.team.resource_msg[i])
            }
          }
        }
      }

      discordIntf.commandResolve('done')
      await client.destroy() // Terminate this Discord bot
    })
  }
  catch(err) {
    console.log(err)
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
    discordIntf.commandReject('fail')
  }
}

export default createVoyageChannels