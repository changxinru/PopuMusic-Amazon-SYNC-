#!/usr/bin/env node
import minimist from 'minimist';
import { runAmazonToFeishuSync } from '../src/sync/amazonToFeishuSync.js';

const argv = minimist(process.argv.slice(2), {
  string: ['start', 'end', 'type'],
  boolean: ['dry-run'],
  alias: { type: 't' }
});

runAmazonToFeishuSync({
  start: argv.start,
  end: argv.end,
  type: argv.type,
  dryRun: argv['dry-run']
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
