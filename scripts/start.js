#!/usr/bin/env node
import { spawn } from 'node:child_process';
import process from 'node:process';
import { fetchCoeData } from './fetch-coe-data.js';

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);

const shouldFetchCoe = hasFlag('--fetch-coe') || hasFlag('--test-api');
const shouldStartDev = (!shouldFetchCoe && args.length === 0) || hasFlag('--dev');

const getNumericArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return fallback;
  }

  const value = Number.parseInt(args[index + 1] ?? '', 10);
  return Number.isNaN(value) ? fallback : value;
};

const getStringArg = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
};

async function run() {
  if (shouldFetchCoe) {
    const limit = getNumericArg('--limit', 5);
    const offset = getNumericArg('--offset', 0);
    const month = getStringArg('--month');
    const category = getStringArg('--category');

    const filters = {};
    if (month) {
      filters.month = month;
    }
    if (category) {
      filters.category = category;
    }

    console.log('Fetching COE data from data.gov.sg...');
    try {
      const result = await fetchCoeData({
        limit,
        offset,
        filters: Object.keys(filters).length ? filters : undefined,
      });

      console.log(`Dataset: ${result.datasetId}`);
      console.log(`Resource: ${result.resourceId}`);
      console.log(`Records returned: ${result.records.length} of ${result.total}`);
      console.table(result.records);
    } catch (error) {
      console.error('Failed to fetch COE data:', error.message);
      if (process.env.DEBUG_DATAGOV === '1') {
        console.error(error);
      }
      process.exitCode = 1;
    }
  }

  if (shouldStartDev) {
    const child = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exitCode = code ?? 0;
      }
    });
  } else if (!shouldFetchCoe) {
    console.log('Nothing to do. Pass --dev to start the Vite dev server or --fetch-coe to test the API.');
  }
}

run();
