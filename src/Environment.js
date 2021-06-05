import dotenv from 'dotenv'
import FileOps from './FileOps.js'

export default class Environment {
  constructor() {
    this.operationalVars = {}
  }

  logEnvVars() {
    console.log('\nEnvironment Variables:')
    console.log('---------------------')
    console.log('- DEBUG: ', process.env.DEBUG)
    console.log('- GUILD_ID: ', process.env.GUILD_ID)
    console.log('- DISCORD_TOKEN: ', process.env.DISCORD_TOKEN)
    console.log('- TEAMS: ', process.env.TEAMS)
    console.log('- POSTS: ', process.env.POSTS)

    return true
  }

  initDotEnv(path) {
    try {
      const pathToEnv = path ? path : `${ __dirname }`
      if (FileOps.validateDirPath(pathToEnv) !== 0) {
        throw new Error(`.env file not found in path - ${ pathToEnv }`)
      }
      const result = dotenv.config( { path: `${ pathToEnv }/.env`, silent: true } )
      if (result.error) {
        throw result.error
      }
    }
    catch (err) {
      throw err
    }
  }

  isDebug() {
    return this.operationalVars.DEBUG
  }

  getOperationalVars() {
    return this.operationalVars
  }

  setOperationalVars(options) {
    // Retrieve the current variable values from `.env` file
    let { DEBUG, GUILD_ID, DISCORD_TOKEN, TEAMS, POSTS} = process.env

    // Initialize `operationalVars` allowing command line parameter values
    // to override `.env` parameters
    const debugValue = options.debug ? options.debug : DEBUG
    this.operationalVars.DEBUG = debugValue.toUpperCase() === 'YES' ? true : false
    this.operationalVars.GUILD_ID = GUILD_ID
    this.operationalVars.DISCORD_TOKEN = DISCORD_TOKEN
    this.operationalVars.TEAMS = options.teams ? options.teams : TEAMS
    this.operationalVars.VALIDATE = options.validate === undefined 
      ? false 
      : options.validate.toUpperCase() === 'Y' ? true : false
      this.operationalVars.POSTS = options.posts ? options.posts : POSTS
  }
}
