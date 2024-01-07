import Bar from 'progress-barjs'
import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'

// Retrieve the channel object for the desired team
const getChannel = (guild, category, teamName) => {
  console.log('replacePosts - getChannel - guild: ', guild, ' category: ', category, 'teamName: ', teamName)
  const channel = guild.channels.cache.find(channel => {
    return channel.name === teamName && channel.parentId === category.discordCategory.id
  })
  return channel
}

const replacePosts = async (environment, GUILD_ID, DISCORD_TOKEN, TEAMS_FILE_NAME, REPLACE_POSTS, REPLACE_TEAMS) => {
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

  // Create the list of team numbers to be replaced
  let teams = []
  if (REPLACE_TEAMS.toLowerCase() === 'all') {
    teams = teamsConfig.teams.map(team => team.name.substring(-1,2)) // Last two characters are team number
  } else {
    teams = process.env.TEAMS.split(',')
  }

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(GUILD_ID)

  try {
    client.on('ready', async () => {

      // Initialize the progress bar
      const replaceBarOptions = {
        label: 'Replacing posts in team channels'.padEnd(32),
        total: teamsConfig.teams.length + categoryNames.length,
        show: {
          overwrite: true,
          'only_at_completed_rows': false,
          bar: {
              completed: '\x1b[47m \x1b[0;37m',
              incompleted: ' ',
          }
        }
      }
      const replaceBar = Bar(replaceBarOptions)

      // Find the channel for each team
      for (let team of teamsConfig.teams) {
        if (team.team.channel_type === "text") {
          console.log('team: ', team)
          const textChannel = getChannel(guild, team.team.category, team.team.name)
          console.log('textChannel: ', textChannel)
          const messages = textChannel.messages.fetch({ after: 0, limit: 2 })
          console.log('messages: ', messages)
        } else {
          // TODO: Add logic to find forum channels & replace messages
        }
        replaceBar.tick(1)
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

export default replacePosts