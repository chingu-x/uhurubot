import { getVoyageTeam } from './Airtable/getVoyageTeam.js'

let groupNo = 1

// Format the category name for a Voyager as `vnn-tiern-gg-🔥`
const getCategoryName = (voyager) => {
  const categoryName = voyager.voyage
    .concat('-',voyager.tier,'-',groupNo.toString().padStart(2,0),'-🔥')
  return categoryName
}

const addCategory = (categories, voyager) => {
  // If this is the first Voyager push the category name onto categores
  if (categories.length === 0) {
    categories.push(getCategoryName(voyager))
  }

  // If there's a change in tier push a new category name onto categores
  const mostRecentCategory = categories.slice(-1)[0]
  if (mostRecentCategory.slice(4,9) !== voyager.tier) {
    groupNo = ++groupNo
    categories.push(getCategoryName(voyager))
  }

  // Return the current category name
  return categories.slice(-1)[0]
}

const addVoyagerToTeam = (teams, currentTeamNo, voyagerCategory, voyager) => {
  if (currentTeamNo !== voyager.team_no) {
    currentTeamNo = voyager.team_no
    const teamName = voyager.tier.concat('-team-',voyager.team_no.padStart(2,0))
    teams.push({
      "team": { 
        "category": voyagerCategory, 
        "name": teamName, 
        "tier": voyager.tier,
        "discord_names": [voyager.discord_name],
        "github_names": [voyager.github_name]
      }
    })
    return voyager.team_no
  }

  const team = teams.slice(-1)[0]
  const discordNames = team.team.discord_names
  const githubNames = team.team.github_names
  discordNames.push(voyager.discord_name)
  githubNames.push(voyager.github_name)
  return voyager.team_no
}

const buildVoyageTeamConfig = async (environment, VOYAGE) => {
  // Retrieve the roster of Voyagers in a specific Voyage
  const voyagers = await getVoyageTeam('v'.concat(VOYAGE).toUpperCase())

  let config = {
    voyage_number: VOYAGE,
    categories: [],
    teams: [],
    team_greeting: [],
    tier_greeting: []
  }

  let teamData = { currentTeamNo: 0 }

  for (let voyager of voyagers) {
    const voyagerCategory = addCategory(config.categories, voyager)
    teamData.currentTeamNo = addVoyagerToTeam(config.teams, teamData.currentTeamNo, voyagerCategory, voyager)
  }

  const configJSON = JSON.stringify(config, null, 2)
  console.log('configJSON: ', configJSON)
}

export default buildVoyageTeamConfig