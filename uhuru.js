const { Command } = require('commander');
const program = new Command();
const { isDebugOn } = require('./src/Environment')
const Discord = require('./src/Discord')
const Environment = require('./src/Environment')

const environment = new Environment()
environment.initDotEnv('./')
let isDebug = false

const consoleLogOptions = (options) => {
  if (isDebug) {
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
  .option('-t, --teams <file-path>', 'Path to the JSON file containing team channels to be created')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      voyage: options.voyage,
      teams: options.teams,
    })

    isDebug = environment.isDebug()

    isDebug && consoleLogOptions(options)
    isDebug && console.log('\noperationalVars: ', environment.getOperationalVars())
    environment.isDebug() && environment.logEnvVars()

    const { DISCORD_TOKEN, VOYAGE, TEAMS } = environment.getOperationalVars()
    
    const discord = new Discord(environment) 
    await discord.createVoyageChannels(DISCORD_TOKEN, VOYAGE, TEAMS)
  })

// Process a request to authorize Chingus to access their Voyage team channels
program 
  .command('authorize')
  .description('Authorize Chingus in a Voyage to access their Discord team channels')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .option('-t, --teams <file-path>', 'Path to the JSON file containing team channels to be created')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      voyage: options.voyage,
      teams: options.teams,
    })

    isDebug = environment.isDebug()

    isDebug && consoleLogOptions(options)
    isDebug && console.log('\noperationalVars: ', environment.getOperationalVars())
    environment.isDebug() && environment.logEnvVars()

    const { VOYAGE, TEAMS } = environment.getOperationalVars()
    
    const discord = new Discord(environment) 
    await discord.grantVoyageChannelAccess()
  })

  program.parse(process.argv)
