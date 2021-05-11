const FileOps = require('./FileOps')

class Discord {
  constructor(environment) {
    this.environment = environment
    this.isDebug = this.environment.isDebug()
  }

  createVoyageChannels(VOYAGE, TEAMS) {
    const rawTeamData = FileOps.readFile(TEAMS)
    const jsonTeamData = JSON.parse(rawTeamData)
    console.log(jsonTeamData)
    console.log(jsonTeamData.voyage_number)
  }

  grantVoyageChannelAccess() {
    
  }

}

module.exports = Discord