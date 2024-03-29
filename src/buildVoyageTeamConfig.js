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
        "channel_type": "forum",
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

const addResourcesToTeam = (voyageNo, team, tier, teamNo, voyagers, tier_project) => {
  const teamNumber = teamNo.padStart(2,0)
  const tierNumber = team.team.tier.slice(4,5)
  const teamProjectDescription = tier_project[tierNumber - 1].greeting.join(' ')

  const findPOs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Product Owner'
  const findSMs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Scrum Master'
  const findUIUXs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'UI/UX'
  const findWebdevs = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Developer'
  const findDataScientists = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Data Scientist'
  const findVoyageGuides = (voyager) => voyager.team_no.padStart(2,0) === teamNumber && voyager.role === 'Voyage Guide'

  const productOwners = voyagers.filter(findPOs).length > 0 ? voyagers.filter(findPOs)
    .map(voyager => '<@'.concat(voyager.discord_name,'>')) : ['None']
  const scrumMasters = voyagers.filter(findSMs).length > 0 ? voyagers.filter(findSMs)
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

  team.team.resource_msg = [
    `\n**__About your Team__**`,
    `\n**Your Tier:** ${ tier.slice(0,1).toUpperCase().concat(tier.slice(1)) }`,
    `\n**Your Team Name:** ${ team.team.name }`,
    `\n**Your Teammates:**`,
    `\n* Product Owners: ${ productOwners.join(' ') }`,
    `\n* Scrum Masters: ${ scrumMasters.join(' ') }`,
    `\n* UI/UX Designer: ${ uiuxDesigners.join(' ') }`,
    `\n* Web Developers: ${ webDevelopers.join(' ') }`,
    `\n* Data Scientists: ${ dataScientists.join(' ') }`,
    `\n* Voyage Guide: ${ voyageGuides.join(' ') }\n`,
    `${ teamProjectDescription }\n`,
    `\n**Resources**:`,
    `\n* GitHub Repo: ${ githubRepoURL }`,
    `\n**Tools**:`,
    `\n* [Hammertime](https://hammertime.cyou/)`,
    `\n* [When2Meet](https://www.when2meet.com/)`
  ]

}

const auditVoyage = (voyagers) => {
  // TODO: Add logic to check for duplicate Voyagers and produce a warning
  // message if any are found
}

const buildVoyageTeamConfig = async (environment, VOYAGE) => {

  // Retrieve the roster of Voyagers in a specific Voyage
  const voyagers = await getVoyageTeam('V'.concat(VOYAGE).toUpperCase())

  const initbarOptions = {
    label: 'Initializing'.padEnd(20),
    total: voyagers.length+1,
    show: {
      overwrite: true,
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
    team_greeting1: [
      ":rocket: **_Congratulations Voyagers!_** You found your team chat! Read carefully below so you don't miss out on getting a good start.\n\n",
      "**__Your First Steps__** \n",
      "1. Say \"hi\" to your team-mates! Come in excited and help welcome your teammates! I will list everyone on the team after this message so you can know exactly who is on your team. Note: @jim_medlock, Chingu-X bot, & the other Admins are not your teammates. :slight_smile:\n",
      "2. Copy/paste the intro you added in https://discord.com/channels/330284646283608064/553103063649353738 into this team channel to let your teammates get to know you!\n",
      "3. Follow the steps in the [Voyage Guide](https://github.com/chingu-voyages/Handbook/blob/main/docs/guides/voyage/voyage.md#voyage-guide) we emailed last week to set a solid foundation for your project. The most important step to concentrate on is scheduling your Team Kickoff meeting as soon as possible.\n\n",
      "**__In your first Sprint you should concentrate on completing these tasks:__**\n",
      "1. Meet your team & schedule kickoff meeting\n",
      "2. Conduct kickoff meeting\n",
      "3. Choose a project & create a Vision Statement (Tier 3 only)\n",
      "4. Define & prioritize MVP features\n\n",
      "**__How can we communicate & collaborate with one another?__**\n",
      "- We've created a simple and easy way to create a voice/video channel for team meetings, one-on-one discussions, & troubleshooting sessions whenever you need them! Check out the `How do I make a voice channel for my team?` section in the Voyage Guide.\n",
      "- You can find out more about each of these in the [Voyage Guide](https://github.com/chingu-voyages/Handbook/blob/main/docs/guides/voyage/voyage.md#voyage-guide).\n\n",
      "**__How can I get the attention of my teammates?__**\n",
      "You can use <#&1104544072347160578> to send a message to all teammates. It's best to avoid using `@everyone`.\n\n"
    ],
    team_greeting2: [
      "**__Finally__**\n",
      "Stay committed to your Voyage goal and active with your team! Remember that the #1 factor to success isn't technology - it's **_daily_** communication & collaboration with your teammates.\n\n"
    ],
    tier_project: [
      { 
        "tier": "tier1", 
        "greeting": [
          "\n**Your Team Project:**\n",
          "All Tier 1 teams will be building the **_Dinosaurs_** app to help your users manage and organize their daily work as a checklist. All teams are required to create this same application from these [requirements & specifications](https://github.com/chingu-voyages/voyage-project-tier1-dinosaurs)."
        ]
      },
      { 
        "tier": "tier2", 
        "greeting": [
          "\n**Your Team Project:**\n",
          "All Tier 2 teams will be building the **_Dinosaurs_** app to help your users manage and organize their daily work as a checklist. All teams are required to create this same application from these [requirements & specifications](https://github.com/chingu-voyages/voyage-project-tier2-dinosaurs)."
        ]
      },
      { 
        "tier": "tier3", 
        "greeting": [
          "\n**Your Team Project:**\n",
          "As a Tier 3 team your team has the choice of building the **__Dinosaurs_** app from the [specifications we provide](https://github.com/chingu-voyages/voyage-project-tier3-dinosaurs) or another app of your own design. \n\n If you choose to create your own you'll want to start by working together to choose a project theme, create a vision statement, and then build a prioritized list of user features.\n\nThis will give you what you need to build the Project Backlog you'll be following to design, build, test, & deploy it."
        ]
      }
    ],
    forum_tags: [
      "General Info", 
      "Meetings",
      "Daily Standups",
      "Sprint Planning", 
      "Discussion", 
      "Help & Advice", 
      "Celebrate", 
      "Issues", 
      "Blockers"
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
      overwrite: true,
      'only_at_completed_rows': false,
      bar: {
          completed: '\x1b[47m \x1b[0;37m',
          incompleted: ' ',
      }
    }
  }
  const buildBar = Bar(buildbarOptions)

  config.teams.forEach(team => {
    addResourcesToTeam(VOYAGE, team, team.team.name.slice(0,5), team.team.name.slice(-2), voyagers, config.tier_project)
    buildBar.tick(1)
  })

  auditVoyage(voyagers)

  try { 
    const configJSON = JSON.stringify(config, null, 2)
    const outputFileName = `${ '/Users/jim/Downloads/v'.concat(config.voyage_number,'_teams_users.json') }`
    fs.writeFileSync(outputFileName, configJSON)
  } catch(err) {
    console.log('writeFileSync failed: ', err)
  }
}

export default buildVoyageTeamConfig