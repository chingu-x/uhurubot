import Discord from './util/Discord.js'
import FileOps from './util/FileOps.js'
import initializeProgressBars from './util/initializeProgressBars.js'

const isInCurrentSprint = (sprintSchedule, currentDate, currentDay) => {
  const today = new Date()
  const currentDayOfWeek = ['sun','mon','tue','wed','thu','fri','sat'][today.getDay()]
  const currentSprint = sprintSchedule.filter(sprint => 
    currentDate >= sprint.start_date && currentDate <= sprint.end_date && currentDay === currentDayOfWeek
  )
  console.log('currentSprint: ', currentSprint)
  return currentSprint.length > 0 ? true : false
}

const postScheduledMessages = async (environment, GUILD_ID, DISCORD_TOKEN, POSTS) => {
  const discordIntf = new Discord(environment)
  const rawPosts = FileOps.readFile(POSTS)
  const posts = JSON.parse(rawPosts)

  const today = new Date()
  const currentDate = today.toISOString().substring(0,10)
  
  let { overallProgress } = initializeProgressBars([], { 
    includeDetailBars: false, includeCategory: false })

  const client = discordIntf.getDiscordClient()
  const guild = await client.guilds.fetch(GUILD_ID)

  try {
    client.on('ready', async () => {
    
      // Loop through the scheduled messages and post any for today to the
      // specified Discord channel
      for (let post of posts.posts) {
        console.log(`post to : ${ post.channel } on day: ${ post.sprint_day } of sprint: ${ post.sprint_number }`)
        console.log('shouldPostToday: ', 
          isInCurrentSprint(posts.voyage.schedule, currentDate, post.sprint_day))
        
        if (isInCurrentSprint(posts.voyage.schedule, currentDate, post.sprint_day)) {
          console.log('here post.message: ', post.message)
          const channel = discordIntf.findChannel(guild, post.channel)
          console.log('channel: ', channel)
          await discordIntf.postGreetingMessage(channel, post.message)
        }

      }

      overallProgress.stop()
      discordIntf.commandResolve('done')
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

export default postScheduledMessages