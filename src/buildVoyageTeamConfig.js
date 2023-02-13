import { getVoyageTeam } from './Airtable/getVoyageTeam.js'

const buildVoyageTeamConfig = async (environment, VOYAGE) => {
  console.log('buildVoyageTeamConfig - VOYAGE: ', VOYAGE)
  const voyagers = await getVoyageTeam('V'.concat(VOYAGE))
  voyagers.forEach((voyager) => {
    console.log(voyager)
  })
}

export default buildVoyageTeamConfig