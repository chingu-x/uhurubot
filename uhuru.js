import { Command } from 'commander'
const program = new Command();
import Environment from './src/Environment.js'
import createVoyageChannels from './src/createVoyageChannels.js'
import grantVoyageChannelAccess from './src/grantVoyageChannelAccess.js'

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
    
    try {
      await createVoyageChannels(environment, DISCORD_TOKEN, TEAMS)
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

    const { DISCORD_TOKEN, TEAMS, VALIDATE } = environment.getOperationalVars()
    
    try {
      await grantVoyageChannelAccess(environment, DISCORD_TOKEN, TEAMS, VALIDATE)
      process.exit(0)
    }
    catch (err) {
      console.log(err)
      process.exit(0)
    }
  })

  program.parse(process.argv)
