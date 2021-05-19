const { Command } = require('commander');
const program = new Command();
const Discord = require('./src/Discord')
const Environment = require('./src/Environment')

const environment = new Environment()
environment.initDotEnv('./')
let debug = false

const consoleLogOptions = (options) => {
  if (environment.isDebug()) {
    console.log('\Uhuru clone command options:')
    console.log('--------------------')
    console.log('- debug: ',options.debug)
    console.log('- voyage: ', options.voyage)
    console.log('- teams: ', options.teams)
  }
}

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

    const { DISCORD_TOKEN, TEAMS } = environment.getOperationalVars()
    
    const discord = new Discord(environment) 
    await discord.createVoyageChannels(DISCORD_TOKEN, TEAMS)
    process.exit(0)
  })

// Process a request to authorize Chingus to access their Voyage team channels
program 
  .command('authorize')
  .description('Authorize Chingus in a Voyage to access their Discord team channels')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --teams <>', 'Path to the JSON file containing team channels to be created')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      teams: options.teams,
    })

    debug = environment.isDebug()

    debug && consoleLogOptions(options)
    debug && console.log('\noperationalVars: ', environment.getOperationalVars())
    debug && environment.logEnvVars()

    const { DISCORD_TOKEN, TEAMS } = environment.getOperationalVars()
    
    const discord = new Discord(environment) 
    const result = await discord.grantVoyageChannelAccess(DISCORD_TOKEN, TEAMS)
    console.log('result: ', result)
    process.exit(0)
  })

  program.parse(process.argv)
