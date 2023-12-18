import fs from 'fs'
import Bar from 'progress-barjs'
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
  } else {

    // If there's a change in tier push a new category name onto categories
    const mostRecentCategory = categories.slice(-1)[0]
    const voyageNameLength = mostRecentCategory.split('-')[0].length
    const sliceStart = voyageNameLength === 3 ? 4 : 5
    const sliceEnd = voyageNameLength === 3 ? 9 : 10
    if (mostRecentCategory.slice(sliceStart,sliceEnd) !== voyager.tier) {
      groupNo = ++groupNo
      categories.push(getCategoryName(voyager))
    }
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
        "channel_type": "text",
        "discord_names": [voyager.discord_name ? voyager.discord_name : ''],
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

const addTeamResourcesToTeam = (voyageNo, team, tier, teamNo, voyagers, tier_project) => {
  const teamNumber = teamNo.padStart(2,0)
  const tierNumber = team.team.tier.slice(4,5)
  const teamProjectDescription = tier_project[tierNumber - 1].greeting

  const findPOs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Product Owner'
  const findUIUXs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'UI/UX'
  const findWebdevs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Developer'
  const findDataScientists = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Data Scientist'
  const findVoyageGuides = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Voyage Guide'

  const productOwners = voyagers.filter(findPOs).length > 0 ? voyagers.filter(findPOs)
    .map(voyager => '<@'.concat(voyager.discord_name,'>')) : ['None']
  const uiuxDesigners = voyagers.filter(findUIUXs).length > 0 ? voyagers.filter(findUIUXs)
    .map(voyager => '<@'.concat(voyager.discord_name,'>')) : ['None']
  const webDevelopers = voyagers.filter(findWebdevs).length > 0 ? voyagers.filter(findWebdevs)
    .map(voyager => '<@'.concat(voyager.discord_name,'>')) : ['None']
  const dataScientists = voyagers.filter(findDataScientists).length > 0 ? voyagers.filter(findDataScientists)
    .map(voyager => '<@'.concat(voyager.discord_name,'>')) : ['None']
  const voyageGuides = voyagers.filter(findVoyageGuides).length > 0 ? voyagers.filter(findVoyageGuides)
    .map(voyager => '<@'.concat(voyager.discord_name,'>')) : ['None']
  const githubRepoURL = `https://github.com/chingu-voyages/v${ voyageNo }-${ team.team.tier }-team-${ teamNo.padStart(2,0) }`

  const resourceMsg = [
    `\n**__Your Tier:__** ${ tier }`,
    `\n**__Your Team Name:__** ${ team.team.name }`,
    `\n**__Your Teammates:__**`,
    `- Product Owners: ${ productOwners.join(' ') }`,
    `- UI/UX Designer: ${ uiuxDesigners.join(' ') }`,
    `- Web Developers: ${ webDevelopers.join(' ') }`,
    `- Data Scientists: ${ dataScientists.join(' ') }`,
    `- Voyage Guide: ${ voyageGuides.join(' ') }\n`,
    `\n**__Your Project:__**`,
    `${ teamProjectDescription }`,
    `\n**__Resources__**:\n`,
    `* GitHub Repo: ${ githubRepoURL }`,
  ]

  team.team.resource_msg = resourceMsg
}

const buildVoyageTeamConfig = async (environment, VOYAGE) => {

  // Retrieve the roster of Voyagers in a specific Voyage
  const voyagers = await getVoyageTeam('V'.concat(VOYAGE).toUpperCase())

  const initbarOptions = {
    label: 'Initializing'.padEnd(20),
    total: voyagers.length+1,
    show: {
      overwrite: false,
      'only_at_completed_rows': false,
      bar: {
          completed: '\x1b[47m \x1b[0;37m',
          incompleted: ' ',
      }
    }
  }
  const initBar = Bar(initbarOptions)
  initBar.tick(1)

  let config = {
    voyage_number: VOYAGE,
    categories: [],
    teams: [],
    team_greeting: [
      ":rocket: **_Congratulations Voyagers!_** You found your team chat! Read carefully below so you don't miss out on getting a good start.\n\n",
      "**__Your First Steps__** \n",
      "1. Say \"hi\" to your team-mates! Come in excited and help welcome your teammates! I will list everyone on the team after this message so you can know exactly who is on your team. Note: @jim_medlock, Chingu-X bot, & the other Admins are not your teammates. :slight_smile:\n",
      "2. Go to <#553103063649353738> and copy/paste your intro into this team channel. This lets your teammates get to know you so get the party can get started!\n",
      "3. Follow the steps in the [Voyage Guide](https://github.com/chingu-voyages/Handbook/blob/main/docs/guides/voyage/voyage.md#voyage-guide) we emailed last week to set a solid foundation for your project. The most important step to concentrate on is scheduling your Team Kickoff meeting as soon as possible.\n\n",
      "**__In your first Sprint you should concentrate on completing these tasks:__**\n",
      "1. Meet your team & schedule kickoff meeting\n",
      "2. Conduct kickoff meeting\n",
      "3. Choose a project & create a Vision Statement\n",
      "4. Define & prioritize MVP features\n\n",
      "**__How can we communicate & collaborate with one another?__**\n",
      "- We've created a simple and easy way to create a voice/video channel for team meetings, one-on-one discussions, & troubleshooting sessions whenever you need them! Check out the `How do I make a voice channel for my team?` section in the Voyage Guide.\n",
      "- You can find out more about each of these in the [Voyage Guide](https://github.com/chingu-voyages/Handbook/blob/main/docs/guides/voyage/voyage.md#voyage-guide).\n\n",
      "**__How can I get the attention of my teammates?__**\n",
      "You can use <@1104544072347160578> to send a message to all teammates. It's best to avoid using `@everyone`.\n\n",
      "**__Finally__**\n",
      "Stay committed to your Voyage goal and active with your team! Remember that the #1 factor to success isn't technology - it's **_daily_** communication & collaboration with your teammates.\n\n https://giphy.com/gifs/F9hQLAVhWnL56"
    ],
    tier_project: [
      { 
        "tier": "tier1", 
        "greeting": [
          ".\n**__Tier 1 Team Project__**\n",
          "All Tier 1 teams will be building the **_Daily Tasks_** app to help your users manage and organize their daily work as a checklist. All teams are required to create this same application from these [requirements & specifications](https://github.com/chingu-voyages/voyage-project-tier1-dailytasks)."
        ]
      },
      { 
        "tier": "tier2", 
        "greeting": [
          ".\n**__Tier 2 Team Project__**\n",
          "All Tier 2 teams will be building the **Daily Tasks** app to help your users manage and organize their daily work as a checklist. All teams are required to create this same application from these [requirements & specifications](https://github.com/chingu-voyages/voyage-project-tier2-dailytasks)."
        ]
      },
      { 
        "tier": "tier3", 
        "greeting": [
          ".\n**__Tier 3 Team Project__**\n",
          "As a Tier 3 team your team has the choice of building the **_Daily Tasks** app from the [specifications we provide](https://github.com/chingu-voyages/voyage-project-tier3-dailytasks) or another app of your own design. \n\n If you choose to create your own you'll want to start by working together to choose a project theme, create a vision statement, and then build a prioritized list of user features.\n\nThis will give you what you need to build the Project Backlog you'll be following to design, build, test, & deploy it."
        ]
      }
    ]
  }

  let teamData = { currentTeamNo: 0 }

  for (let voyager of voyagers) {
    const voyagerCategory = addCategory(config.categories, voyager)
    teamData.currentTeamNo = addVoyagerToTeam(config.teams, teamData.currentTeamNo, voyagerCategory, voyager)
    initBar.tick(1)
  }

  const buildbarOptions = {
    label: 'Building config file'.padEnd(20),
    total: config.teams.length,
    show: {
      overwrite: false,
      'only_at_completed_rows': false,
      bar: {
          completed: '\x1b[47m \x1b[0;37m',
          incompleted: ' ',
      }
    }
  }
  const buildBar = Bar(buildbarOptions)

  config.teams.forEach(team => {
    addTeamResourcesToTeam(VOYAGE, team, team.team.name.slice(0,4), team.team.name.slice(-2), voyagers, config.tier_project)
    buildBar.tick(1)
  })

  try { 
    const configJSON = JSON.stringify(config, null, 2)
    const outputFileName = `${ '/Users/jim/Downloads/v'.concat(config.voyage_number,'_teams_users.json') }`
    fs.writeFileSync(outputFileName, configJSON)
  } catch(err) {
    console.log('writeFileSync failed: ', err)
  }
}

export default buildVoyageTeamConfig