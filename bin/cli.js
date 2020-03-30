#!/usr/bin/env node

const pkg = require('../package.json')
require('update-notifier')({ pkg }).notify()

const argv = require('yargs')
  .usage('es-cleaner --url=<...> [--days=30] [--reg-exp=[0-9]{4}-[0-9]{2}-[0-9]{2}$] [--for-real]')
   // Url
  .describe('url', 'Elastic Search url, including the port if needed.')
  .string('url')
  .alias('url', 'u')
  .demandOption(['url'])
  // Days
  .describe('days', 'How old should indices be in order to be deleted?')
  .number('days')
  .alias('days', 'd')
  .default('days', 30)
  // Regex
  .describe('reg-exp', 'Regex Expression to match the date part of the index name.')
  .string('reg-exp')
  .alias('reg-exp', 'r')
  .default('reg-exp', '[0-9]{4}-[0-9]{2}-[0-9]{2}$')
  // Dry run
  .describe('for-real', 'A flag to actually delete the indices.')
  .boolean(['for-real'])
  .default('for-real', false)
  // Footer
  .epilogue('For more information, find our manual at http://example.com')
  .wrap(120)
  .strict(true)
  .argv

const ElasticSearchCleaner = require('../lib/ElasticSearchCleaner')

if (!argv.help && !argv.version) {
  const elasticSearchCleaner = new ElasticSearchCleaner(
    argv.url,
    argv.days,
    argv.regExp,
    argv.forReal
  )

  elasticSearchCleaner.exec()
}
