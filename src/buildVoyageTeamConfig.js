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
  return categories.slice(-1)
}

const addVoyagerToTeam = (teams, voyagerCategory, voyager) => {
  
}

const buildVoyageTeamConfig = async (environment, VOYAGE) => {
  // Retrieve the roster of Voyagers in a specific Voyage
  const voyagers = await getVoyageTeam('v'.concat(VOYAGE).toUpperCase())
  voyagers.forEach((voyager) => {
    console.log(voyager)
  })

  let config = {
    voyage_number: VOYAGE,
    categories: [],
    teams: [],
    team_greeting: [],
    tier_greeting: []
  }

  for (let voyager of voyagers) {
    const voyagerCategory = addCategory(config.categories, voyager)
    addVoyagerToTeam(config.teams, voyagerCategory, voyager)
  }

  console.log('config: ', config)
}

export default buildVoyageTeamConfig