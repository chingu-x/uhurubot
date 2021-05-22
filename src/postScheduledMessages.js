import Discord from './Discord.js'
import FileOps from './FileOps.js'
import initializeProgressBars from './initializeProgressBars.js'

const isInCurrentSprint = (sprintSchedule, currentDate) => {
  const currentSprint = sprintSchedule.filter(sprint => 
    currentDate >= sprint.start_date && currentDate <= sprint.end_date
  )
  return currentSprint.length > 0 ? true : false
}

const findChannel = (channelName) => {
  const indexOfSlash = channelName.indexOf('/')
  const categoryName = indexOfSlash >= 0 ? channelName.substring(0,indexOfSlash) : ''
  const realChannelName = indexOfSlash >= 0 ? channelName.substring(indexOfSlash + 1) : channelName
  console.log(`categoryName: ${ categoryName } realChannelName: ${ realChannelName }`)
  return 0 
}

const postScheduledMessages = async (environment, DISCORD_TOKEN, POSTS) => {
  const discordIntf = new Discord(environment)
  const rawPosts = FileOps.readFile(POSTS)
  const posts = JSON.parse(rawPosts)

  const today = new Date()
  const currentDate = today.toISOString().substring(0,10)
  const currentDayOfWeek = ['sun','mon','tue','wed','thu','fri','sat'][today.getDay()]
  
  let { overallProgress } = initializeProgressBars([], { 
    includeDetailBars: false, includeCategory: false })

  const client = discordIntf.getDiscordClient()
  try {
    client.on('ready', async () => {
      const channels = client.channels.cache.array()
      const guild = channels[0].guild
    
      // Loop through the scheduled messages and post any for today to the
      // specified Discord channel
      for (let post of posts.posts) {
        console.log(`post to : ${ post.channel } on day: ${ post.sprint_day } of sprint: ${ post.sprint_number }`)
        console.log('shouldPostToday: ', 
          isInCurrentSprint(posts.voyage.schedule, currentDate))
        
        if (isInCurrentSprint(posts.voyage.schedule, currentDate) && post.sprint_day === currentDayOfWeek) {
          //let channel = discordIntf.isChannelCreated(guild, team.team.name)
          const channel = findChannel(post.channel)

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