import { getVoyageTeam } from './Airtable/getVoyageTeam.js'

const buildVoyageTeamConfig = async (environment, VOYAGE) => {
  console.log('buildVoyageTeamConfig - VOYAGE: ', VOYAGE)
  const voyagers = await getVoyageTeam('V'.concat(VOYAGE))
  console.log('...voyagers: ', voyagers)
}

export default buildVoyageTeamConfig