#!/usr/bin/env node
import process from 'node:process';

const DATA_GOV_BASE = 'https://data.gov.sg/api';
const DATASET_ID = 'd_69b3380ad7e51aff3a7dcc84eba52b8a';

function logDebug(message) {
  if (process.env.DEBUG_DATAGOV === '1') {
    console.debug(`[data.gov.sg] ${message}`);
  }
}

async function getDatasetMetadata(fetchImpl = fetch) {
  const response = await fetchImpl(`${DATA_GOV_BASE}/action/package_show?id=${DATASET_ID}`);
  if (!response.ok) {
    throw new Error(`Failed to load dataset metadata: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error('Dataset metadata request did not succeed.');
  }

  return payload.result;
}

function selectResource(metadata) {
  if (!metadata?.resources?.length) {
    throw new Error('Dataset does not expose any downloadable resources.');
  }

  const preferred = metadata.resources.find((resource) => resource.datastore_active);
  if (preferred) {
    return preferred;
  }

  // Fallback to the first CSV-like resource if datastore_active is false.
  const csvLike = metadata.resources.find((resource) => {
    const format = resource.format?.toLowerCase();
    return format === 'csv' || format === 'json';
  });

  if (!csvLike) {
    throw new Error('Unable to locate a datastore-backed resource for the COE dataset.');
  }

  return csvLike;
}

function encodeFilters(filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return '';
  }

  return `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
}

export async function fetchCoeData({ limit = 20, offset = 0, filters } = {}, fetchImpl = fetch) {
  if (limit <= 0) {
    throw new Error('`limit` must be greater than 0.');
  }

  if (offset < 0) {
    throw new Error('`offset` cannot be negative.');
  }

  logDebug(`Fetching dataset metadata for ${DATASET_ID}`);
  const metadata = await getDatasetMetadata(fetchImpl);
  const resource = selectResource(metadata);
  const resourceId = resource.id;

  logDebug(`Using resource ${resourceId}`);
  const url = `${DATA_GOV_BASE}/action/datastore_search?resource_id=${resourceId}&limit=${limit}&offset=${offset}${encodeFilters(filters)}`;
  logDebug(`Requesting ${url}`);

  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Failed to retrieve COE data: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error('COE data request did not succeed.');
  }

  const { records = [], total = 0, fields = [] } = payload.result ?? {};
  return {
    datasetId: DATASET_ID,
    resourceId,
    records,
    total,
    fields,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const limitArgIndex = process.argv.indexOf('--limit');
  const offsetArgIndex = process.argv.indexOf('--offset');
  const limit = limitArgIndex > -1 ? Number.parseInt(process.argv[limitArgIndex + 1] ?? '', 10) : 5;
  const offset = offsetArgIndex > -1 ? Number.parseInt(process.argv[offsetArgIndex + 1] ?? '', 10) : 0;

  fetchCoeData({ limit, offset })
    .then((result) => {
      console.log(JSON.stringify({
        datasetId: result.datasetId,
        resourceId: result.resourceId,
        total: result.total,
        sample: result.records,
      }, null, 2));
    })
    .catch((error) => {
      console.error('Failed to fetch COE data:', error.message);
      if (process.env.DEBUG_DATAGOV === '1') {
        console.error(error);
      }
      process.exitCode = 1;
    });
}
