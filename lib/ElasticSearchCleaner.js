const axios = require('axios')
const chalk = require('chalk')

const ElasticSearchCleaner = function (url, days, regex = null, noPretend = false) {
  this.url = url
  this.days = days
  this.noPretend = noPretend

  if (regex) {
    this.dateRule = new RegExp(regex)
  } else {
    this.dateRule = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}$')
  }

  const milliSecondsAgo = this.days * 86400000

  this.timeLimit = new Date().getTime() - milliSecondsAgo
}

ElasticSearchCleaner.prototype.exec = function exec () {
  if (!this.noPretend) {
    this.printInfo(chalk.yellow('Dry run! No actual deletion!'))
  }

  axios.get(`${this.url}/_cat/indices?v`, { headers: { Accept: 'application/json' } })
    .then(this.readResponse.bind(this))
    .then(this.extractIndices.bind(this))
    .then(this.filterByValidDate.bind(this))
    .then(this.filterByEligibleDate.bind(this))
    .then(this.deleteIndices.bind(this))
    .then(this.done.bind(this))
    .catch(this.handleRejection.bind(this))
}

ElasticSearchCleaner.prototype.readResponse = function readResponse (response) {
  if (Array.isArray(response.data)) {
    return response.data
  }

  throw new Error('Data is not in the expected format.')
}

ElasticSearchCleaner.prototype.extractIndices = function extractIndices (data) {
  let indices = data.map((index) => {
    if (index.index) {
      return index.index
    }

    return null
  })

  indices = indices.filter((index) => {
    return index !== null
  })

  if (!indices.length) {
    throw new Error('No indices found!')
  }

  this.printInfo(`Total indices found: ${chalk.yellow(indices.length)}`)

  return Promise.resolve(indices)
}

ElasticSearchCleaner.prototype.filterByValidDate = function filterByValidDate (data) {
  const indices = data.filter((index) => {
    return this.dateRule.test(index)
  })

  this.printInfo(`Total indices that qualify for checking: ${chalk.green(indices.length)}`)

  return Promise.resolve(indices)
}

ElasticSearchCleaner.prototype.filterByEligibleDate = function filterByEligibleDate (data) {
  const indices = data.filter((index) => {
    const result = index.match(this.dateRule)

    const indexDate = new Date(result[0]).getTime()

    return indexDate < this.timeLimit
  })

  this.printInfo(`Total indices that qualify for deletion: ${chalk.red(indices.length)}`)

  return Promise.resolve(indices)
}

ElasticSearchCleaner.prototype.deleteIndices = function deleteIndices (data) {
  const requests = data.map((index) => {
    const cb = () => {
      this.printInfo(`Index ${chalk.red(index)} deleted!`)
    }

    if (this.noPretend) {
      return axios.delete(`${this.url}/${index}`).then(cb)
    }

    return Promise.resolve().then(cb)
  })

  return Promise.all(requests)
}

ElasticSearchCleaner.prototype.done = function done (responses) {
  this.printInfo(chalk.green(`Deleted indices: ${responses.length}`))
  this.printInfo(chalk.green('Done!'))
}

ElasticSearchCleaner.prototype.handleRejection = function handleRejection (err) {
  console.error(`Error: ${err.message}`)
}

ElasticSearchCleaner.prototype.printInfo = function printInfo (message) {
  console.info(message)
}

module.exports = ElasticSearchCleaner
