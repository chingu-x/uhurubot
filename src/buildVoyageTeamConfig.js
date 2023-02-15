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
    team_greeting: [
      ":rocket: **_Congratulations Voyagers!_** You found your team chat! Read carefully below so you don't miss out on getting a good start. https://giphy.com/gifs/F9hQLAVhWnL56\n",
      "**_Your First Steps _** \n",
      "1. Say \"hi\" to your team-mates! Come in excited and help welcome your teammates! I will list everyone on the team after this message so you can know exactly who is on your team. Note: @jim_medlock, Chingu-X bot, & the other Admins are not your teammates. :slight_smile:\n", 
      "2. Go to #🖐introduce-yourself and copy/paste your intro into this channel. This let your teammates get to know you so get the party can get started!\n",
      "3. Follow the steps in the Voyage Guide we provided last week to set a solid foundation for your project. The most important step to concentrate on is scheduling your Team Kickoff meeting as soon as possible."
    ],
    tier_greeting: [
      { 
        "tier": "tier1", 
        "greeting": [
          "**__Tier 1 Team Project__**\n",
          "If you are a Toucans (tier 1) team you are required to create the **_Chuck Norris Quotes_** app. All Toucans teams are required to create this same application from these requirements & specifications --> https://github.com/chingu-voyages/voyage-project-tier1-norris."
        ]
      }
    ]
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