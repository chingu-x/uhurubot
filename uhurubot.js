import { Command } from 'commander'
const program = new Command()
import Environment from './src/util/Environment.js'
import Schedule from './src/util/Schedule.js'
import buildVoyageTeamConfig from './src/buildVoyageTeamConfig.js'
import createVoyageChannels from './src/createVoyageChannels.js'
import grantVoyageChannelAccess from './src/grantVoyageChannelAccess.js'
import postScheduledMessages from './src/postScheduledMessages.js'
import sendScheduledEmails from './src/sendScheduledEmails.js'
import replacePosts from './src/replacePosts.js'

const environment = new Environment()
environment.initDotEnv('./')
let debug = false

const consoleLogOptions = (options) => {
  if (environment.isDebug()) {
    console.log('\Uhuru clone command options:')
    console.log('--------------------')
    console.log('- debug: ', options.debug)
    console.log('- guild id: ', options.guildID)
    console.log('- voyage: ', options.voyage)
    console.log('- teams: ', options.teams)
    console.log('- posts: ', options.posts)
    console.log('- schedule: ', options.schedule)
  }
}

// Process a request to create new Voyage team channels
program 
  .command('build')
  .description('Build the teams json config file for the next Chingu Voyage')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --teams <teams>', 'Path to the JSON file containing team channels to be created')
  .action(async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      teams: options.teams,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    const { VOYAGE } = environment.getOperationalVars()
    
    try {
      await buildVoyageTeamConfig(environment, VOYAGE)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })

// Process a request to create new Voyage team channels
program 
  .command('create')
  .description('Create team channels in Discord for an upcoming Chingu Voyage')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --teams <teams>', 'Path to the JSON file containing team channels to be created')
  .action(async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      teams: options.teams,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    const { GUILD_ID, DISCORD_TOKEN, TEAMS } = environment.getOperationalVars()
    
    try {
      await createVoyageChannels(environment, GUILD_ID, DISCORD_TOKEN, TEAMS)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })

// Process a request to replace messages in one or more Voyage team channels
program 
  .command('replace')
  .description('Replace messages in one or more team channels in Discord for a Chingu Voyage')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --teams <teams>', 'Path to the JSON file containing team channels to be created')
  .option('-r, --replace_posts <postIds>', 'NONE, omit, or a csv list of unique post numbers to replace')
  .option('-i, --replace_teams <replaceTeams>','ALL or a csv list of team numbers')
  .action(async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      teams: options.teams,
      postIds: options.postIds,
      replaceTeams: options.replaceTeams,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    const { GUILD_ID, DISCORD_TOKEN, TEAMS, REPLACE_POSTS, REPLACE_TEAMS } = environment.getOperationalVars()
    
    try {
      await replacePosts(environment, GUILD_ID, DISCORD_TOKEN, TEAMS, REPLACE_POSTS, REPLACE_TEAMS)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })  

// Process a request to authorize Chingus to access their Voyage team channels
program 
  .command('authorize')
  .description('Authorize Chingus in a Voyage to access their Discord team channels')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --teams <teams>', 'Path to the JSON file containing team channels to be created')
  .option('-v, --validate <y|n>', 'Validate Discord user names without creating authorizations')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      teams: options.teams,
      validate: options.validate,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    const { DISCORD_TOKEN, GUILD_ID, TEAMS, VALIDATE } = environment.getOperationalVars()
    
    try {
      await grantVoyageChannelAccess(environment, DISCORD_TOKEN, TEAMS, VALIDATE)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })

  // Process a request to send scheduled emails to specific Chingu's
  program 
  .command('email')
  .description('send scheduled emails to specific Chingu\'s')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-s, --schedule <path>', 'Path to the JSON file containing the email schedule')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      schedule: options.posts,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    
    try {
      const { SCHEDULE } = environment.getOperationalVars()
      const schedule = new Schedule(SCHEDULE)
      await sendScheduledEmails(environment, schedule)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })

  // Process a request to post scheduled messages to Discord channels
  program 
  .command('post')
  .description('Post scheduled messages to specific Discord channels')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --posts <posts>', 'Path to the JSON file containing messages to be posted')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      posts: options.posts,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    const { DISCORD_TOKEN, GUILD_ID, POSTS } = environment.getOperationalVars()
    
    try {
      await postScheduledMessages(environment, GUILD_ID, DISCORD_TOKEN, POSTS)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })

  program.parse(process.argv)
