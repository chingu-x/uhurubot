const { Command } = require('commander');
const program = new Command();
const { isDebugOn } = require('./src/Environment')

const environment = new Environment()
environment.initDotEnv('./')
let isDebug = false

const consoleLogOptions = (options) => {
  if (isDebug) {
    console.log('\Uhuru clone command options:')
    console.log('--------------------')
    console.log('- debug: ',options.debug)
    console.log('- voyage: ', options.voyage)
  }
}

let reposToCreate = []
const generateRepoList = (voyageName, teams) => {
  let teamNo = 0
  for (let teamCount = 0; teamCount < teams.length; teamCount++) {
    if (teams[teamCount].count > 0) {
      for (let currentTeamNo = 1; currentTeamNo <= teams[teamCount].count; currentTeamNo++) {
        teamNo += 1
        reposToCreate.push({ 
          voyageName: `${ voyageName }`,
          tierName: `${ teams[teamCount].name.toLowerCase() }`,
          teamNo: `${ teamNo.toString().padStart(2, "0") }` 
        })
      }
    }
  }
}

// Interpret command line directives and options
program 
  .command('create')
  .description('Clone a template GitHub repo to create Chingu Voyage Repos')
  .option('-d, --debug <debug>', 'Debug switch to add runtime info to console (YES/NO)')
  .action( async (options) => {
    environment.setOperationalVars({
      debug: options.debug,
      voyage: options.voyage,
    })

    isDebug = environment.isDebug()

    isDebug && consoleLogOptions(options)
    isDebug && console.log('\noperationalVars: ', environment.getOperationalVars())
    environment.isDebug() && environment.logEnvVars()

    const { VOYAGE } = environment.getOperationalVars()
    generateRepoList(VOYAGE, [
      { name: TIER1_NAME, count: NO_TIER1_TEAMS },
      { name: TIER2_NAME, count: NO_TIER2_TEAMS },
      { name: TIER3_NAME, count: NO_TIER3_TEAMS }
    ])
    
    const github = new GitHub(environment) 
    await github.cloneTemplate(reposToCreate)
  })

  program.parse(process.argv)
