import cliProgress from 'cli-progress'
import _colors from 'colors'

const initializeProgressBars = (categoriesToCreate) => {
  const DESC_MAX_LTH = 30
  let progressBars = []
  let overallProgress = new cliProgress.MultiBar({
    format: '{description} |' + _colors.brightGreen('{bar}') + '| {value}/{total} | {percentage}% | {duration} secs.',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: false,
    hideCursor: true
  }, cliProgress.Presets.shades_classic)

  for (let categoryNo = 0; categoryNo < categoriesToCreate.length; ++categoryNo) {
    progressBars[categoryNo] = overallProgress.create(1, 0)
    progressBars[categoryNo].update(0, { 
      description: 'Category: '.concat(categoriesToCreate[categoryNo].name.padEnd(DESC_MAX_LTH, ' ')) 
    })
  }

  return { overallProgress, progressBars }
}

export default initializeProgressBars