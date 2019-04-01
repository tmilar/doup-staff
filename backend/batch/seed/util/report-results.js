module.exports = function reportResults(results) {
  if (!results) {
    const errMsg = 'No results to report!'
    throw new Error(errMsg)
  }

  if (results.length === 0) {
    console.log('Did not find any row to read from the Spreadsheet.')
    return
  }

  const resultsStr = results
    .map(({result}, i) => `#${i + 1} ${result}`)
    .join('\n')

  console.log(resultsStr)
}
