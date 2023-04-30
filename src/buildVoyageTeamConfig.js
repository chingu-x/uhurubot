import fs from 'fs'
import { getVoyageTeam } from './Airtable/getVoyageTeam.js'

let groupNo = 1

// Format the category name for a Voyager as `vnn-tiern-gg-🔥`
const getCategoryName = (voyager) => {
  const categoryName = voyager.voyage
    .concat('-',voyager.tier,'-',groupNo.toString().padStart(2,0),'-🔥')
  return categoryName
}

const addCategory = (categories, voyager) => {
  // If this is the first Voyager push the category name onto categories
  if (categories.length === 0) {
    categories.push(getCategoryName(voyager))
  }

  // If there's a change in tier push a new category name onto categories
  const mostRecentCategory = categories.slice(-1)[0]
  //console.log(`mostRecentCategory: ${ mostRecentCategory } voyager.tier: ${ voyager.tier }`)
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
      team: {
        "category": voyagerCategory, 
        "name": teamName, 
        "tier": voyager.tier,
        "discord_names": [voyager.discord_name],
        "github_names": [voyager.github_name] ? [voyager.github_name] : '',
        "resource_msg": []
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

const addTeamResourcesToTeam = (team, teamNo, voyagers) => {
  const teamNumber = teamNo.padStart(2,0)
  const findPOs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Product Owner'
  const findUIUXs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'UI/UX'
  const findWebdevs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Developer'
  const findDataScientists = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Data Scientist'
  const findVoyageGuides = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Voyage Guide'

  const productOwners = voyagers.filter(findPOs) ? voyagers.filter(findPOs)
    .map(voyager => '@'.concat(voyager.discord_name)) : 'None'
  const uiuxDesigners = voyagers.filter(findUIUXs) ? voyagers.filter(findUIUXs)
    .map(voyager => '@'.concat(voyager.discord_name)) : 'None'
  const webDevelopers = voyagers.filter(findWebdevs) ? voyagers.filter(findWebdevs)
    .map(voyager => '@'.concat(voyager.discord_name)) : 'None'
  const dataScientists = voyagers.filter(findDataScientists) ? voyagers.filter(findDataScientists)
    .map(voyager => '@'.concat(voyager.discord_name)) : 'None'
  const voyageGuides = voyagers.filter(findVoyageGuides) ? voyagers.filter(findVoyageGuides)
    .map(voyager => '@'.concat(voyager.discord_name)) : 'None'
  const githubRepoURL = `https://github.com/chingu-voyages/v44-tier-team-${ teamNo.padStart(2,0) }`
  const gdrivePlaceholderURL = 'https://drive.google.com/drive/folders/'

  const resourceMsg = [
    `**__${ voyagers[0].voyage.concat('-',team.team.name) } team:__**\n`,
    `- Product Owners: ${ productOwners.toString() }\n`,
    `- UI/UX Designer: ${ uiuxDesigners.toString() }\n`,
    `- Web Developers: ${ webDevelopers.toString() }\n`,
    `- Data Scientists: ${ dataScientists.toString() }\n`,
    `- Voyage Guide: ${ voyageGuides.toString() }\n\n`,
    `**__Resources:\n`,
    `- GitHub Repo: ${ githubRepoURL }\n`,
    `- Google Drive: ${ gdrivePlaceholderURL} \n`,
  ]

  team.team.resource_msg = resourceMsg
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
      "2. Go to #🖐introduce-yourself and copy/paste your intro into this team channel. This lets your teammates get to know you so get the party can get started!\n",
      "3. Follow the steps in the Voyage Guide we provided last week to set a solid foundation for your project. The most important step to concentrate on is scheduling your Team Kickoff meeting as soon as possible.\n\n",
      "**_In your first Sprint you should concentrate on completing these tasks:\n",
      "1. Meet your team & schedule kickoff meeting\n",
      "2. Conduct kickoff meeting\n",
      "3. Choose a project & create a Vision Statement\n",
      "4. Define & prioritize MVP features\n\n",
      "You can find out more about each of these in the Voyage Guide (https://chingucohorts.notion.site/Voyage-Guide-1e528dcbf1d241c9a93b4627f6f1c809).\n\n",
      "Finally, stay committed to your Voyage goal and active with your team! Remember that the #1 factor to success isn't technology - it's daily **_communication & collaboration with your teammates.\n"
    ],
    tier_greeting: [
      { 
        "tier": "tier1", 
        "greeting": [
          "**__Tier 1 Team Project__**\n",
          "All Tier 1 teams will be building the **_Array Game_** app. All teams are required to create this same application from these requirements & specifications --> https://github.com/chingu-voyages/voyage-project-tier1-arraygame."
        ]
      },
      { 
        "tier": "tier2", 
        "greeting": [
          "**__Tier 2 Team Project__**\n",
          "All Tier 2 teams will be building the **_Boolebots game_**. All teams are required to create this same application from these requirements & specifications --> https://github.com/chingu-voyages/voyage-project-tier2-boolebots."
        ]
      }
    ]
  }

  let teamData = { currentTeamNo: 0 }

  for (let voyager of voyagers) {
    const voyagerCategory = addCategory(config.categories, voyager)
    teamData.currentTeamNo = addVoyagerToTeam(config.teams, teamData.currentTeamNo, voyagerCategory, voyager)
  }

  config.teams.forEach(team => {
    addTeamResourcesToTeam(team, team.team.name.slice(-2), voyagers)
  })  

  try { 
    const configJSON = JSON.stringify(config, null, 2)
    const outputFileName = `${ '/Users/jim/Downloads/v'.concat(config.voyage_number,'_teams_users_test.json') }`
    fs.writeFileSync(outputFileName, configJSON)
  } catch(err) {
    console.log('writeFileSync failed: ', err)
  }
}

export default buildVoyageTeamConfig