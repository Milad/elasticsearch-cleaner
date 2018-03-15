# Elasticsearch Cleaner
Asynchronously prune your Elasticsearch indices. In the browser, in Node.js or in the command-line interface. Assuming that your indices follow the official recommendation to have one [Index per Time Frame](https://www.elastic.co/guide/en/elasticsearch/guide/current/time-based.html#index-per-timeframe). If indices are not conventionally named, then this module/cli tool can't help you.

## Motivation
Ability to prune indices is needed to save storage space, or to comply with data protection laws like [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation).

## Installation
Install globally to use it any where within your system.
```bash
npm i elasticsearch-cleaner -g
```

Or install it inside your web project.
```bash
npm i elasticsearch-cleaner
```
## Usage

### CLI

```bash
es-cleaner --url=<...> [--days=30] [--reg-exp=[0-9]{4}-[0-9]{2}-[0-9]{2}$] [--no-pretend]
```
Options:
- `--help`: Show help
- `--version`: Show version number
- `--url` or `-u`: Elasticsearch url, including the port if needed.
    - Required.
- `--days` or `-d`: How old should indices be in order to be deleted?
    - Default: 30 days.
- `--reg-exp` or `-r`: Regex Expression to match the date part of the index name.
    - Default: `[0-9]{4}-[0-9]{2}-[0-9]{2}$` (Matches `YYYY-MM-DD` at the end).
    - A string that will be passed to `new RegExp`.
- `--no-pretend`: A flag to actually delete the indices. By default the tool doesn't delete anything, it only shows you what it would delete.
    - Required to actually delete the indices.

### As JS Module

```javascript
// ES6 syntax
import ElasticSearchCleaner from 'elasticsearch-cleaner';

// Node.js
const ElasticSearchCleaner = require('elasticsearch-cleaner');

// These arguments are the same ones listed above in the cli explanation.
const url = 'https://elasticsearch:example.com';
const age = 30;
const regexp = '[0-9]{4}-[0-9]{2}-[0-9]{2}$';
const noPretend = true;

const elasticSearchCleaner = new ElasticSearchCleaner(url, age, regexp, noPretend);

elasticSearchCleaner.exec();
```

## License
Unlicense
