const { readFileSync, writeFileSync } = require('fs');
const { makeMatch } = require('../functions/functions');

const data = JSON.parse(readFileSync('./z-test/data.json', { encoding: 'utf8' }));

const result = makeMatch(data);

writeFileSync('./z-test/match.json', JSON.stringify(result), { encoding: 'utf8' });