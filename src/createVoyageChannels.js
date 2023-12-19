import Bar from 'progress-barjs'
import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'

const lookupDiscordCategory = (categoryNames, categoryName) => {
  const category = categoryNames.find(category => category.name === categoryName)
  return category
}

const createTextTeamChannels = async (discordIntf, guild, categoryNames, team, teamsConfig) => {
  // Create & populate team channels
  let discordChannel = discordIntf.isChannelCreated(guild, team.team.name)
  let discordCategory = lookupDiscordCategory(categoryNames, team.team.category)
  if (discordCategory === undefined || discordCategory === null) {
    throw new Error(`Category name '${ team.team.category }' is undefined in the configuration.`)
  }
  if (discordChannel === undefined || discordChannel === null) {
    discordChannel = await discordIntf.createChannel(guild, discordCategory.discordCategory.id, team.team.name)

    if (teamsConfig.team_greeting !== undefined) {
      let teamMessage = '' 
      for (let i = 0; i < teamsConfig.team_greeting.length; ++i) {
        teamMessage = teamMessage.concat(teamsConfig.team_greeting[i])
      }
      const greetingMsg = await discordIntf.postGreetingMessage(discordChannel, teamMessage)
      greetingMsg.pin()
    }

    // Post a list of team members by their roles
    let teamResourceMsg
    if (team.team.resource_msg !== undefined) {
      for (let i = 0; i < team.team.resource_msg.length; ++i) {
        let teamMsg = await discordIntf.postGreetingMessage(discordChannel, team.team.resource_msg[i])
        if (i === 0) {
          teamResourceMsg = teamMsg
        }
      }
      if (teamResourceMsg !== null) {
        teamResourceMsg.pin()
      }
    }
  }
}

const createForumTeamChannels = async (discordIntf, guild, categoryNames, teamsConfig) => {

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

      // Initialize the progress bar
      const buildbarOptions = {
        label: 'Creating & populating team channels'.padEnd(20),
        total: teamsConfig.teams.length + categoryNames.length,
        show: {
          overwrite: false,
          'only_at_completed_rows': false,
          bar: {
              completed: '\x1b[47m \x1b[0;37m',
              incompleted: ' ',
          }
        }
      }
      const buildBar = Bar(buildbarOptions)

      // Create the Voyage categories
      for (let i = 0; i < categoryNames.length; i++) {
        let discordCategory = discordIntf.isCategoryCreated(guild, categoryNames[i].name)
        if (discordCategory === undefined) {
          discordCategory = await discordIntf.createChannelCategory(guild, categoryNames[i].name)
        }
        categoryNames[i].discordCategory = discordCategory
        buildBar.tick(1)
      }

      // Create the team channels and populate with Voyage information & guidance
      for (let team of teamsConfig.teams) {
        if (team.team.channel_type === "text") {
          await createTextTeamChannels(discordIntf, guild, categoryNames, team, teamsConfig)
        } else {
          await createForumTeamChannels(discordIntf, guild, categoryNames, team, teamsConfig)
        }
        buildBar.tick(1)
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