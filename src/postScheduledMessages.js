import Discord from './Discord.js'
import FileOps from './FileOps.js'
import initializeProgressBars from './initializeProgressBars.js'

const postScheduledMessages = async (environment, DISCORD_TOKEN, POSTS) => {
  const discordIntf = new Discord(environment)
  const rawPosts = FileOps.readFile(POSTS)
  const posts = JSON.parse(rawPosts)
  console.log('posts: ', posts)
  
  let { overallProgress } = initializeProgressBars([], { 
    includeDetailBars: false, includeCategory: false })


  const client = discordIntf.getDiscordClient()
  try {
    client.on('ready', async () => {
      // Loop through the scheduled messages and post any for today to the
      // specified Discord channel
      for (let post of posts.posts) {
        console.log('post: ', post)
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