import cliProgress from 'cli-progress'
import _colors from 'colors'

const initializeProgressBars = (teamsToCreate) => {
  const ALL_TEAMS = 0
  const DESC_MAX_LTH = 30
  const CATEGORY_NO = 1
  let progressBars = []

  let overallProgress = new cliProgress.MultiBar({
    format: '{description} |' + _colors.brightGreen('{bar}') + '| {value}/{total} | {percentage}% | {duration} secs.',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: false,
    hideCursor: true
  }, cliProgress.Presets.shades_classic)

  progressBars[ALL_TEAMS] = overallProgress.create(teamsToCreate.length, 0)
  progressBars[ALL_TEAMS].update(0, { description: 'Overall progress'.padEnd(DESC_MAX_LTH+10, ' ') })
  
  for (let teamNo = 0; teamNo < teamsToCreate.length; ++teamNo) {
    progressBars[teamNo+1] = overallProgress.create(1, 0)
    progressBars[teamNo+1].update(0, { 
      description: teamNo+1 === CATEGORY_NO 
        ? 'Category: '.concat(teamsToCreate[teamNo].padEnd(DESC_MAX_LTH, ' ')) 
        : 'Channel:  '.concat(teamsToCreate[teamNo].padEnd(DESC_MAX_LTH, ' '))
    })
  }

  return { overallProgress, progressBars }
}

export default initializeProgressBars