import { deprecatePatch, patched, proxyActivities } from '@temporalio/workflow';

import type * as activities from '../shared-activities.js';

const { processData } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

export async function patchWorkflow(
  dataId = `patch_${Date.now()}`,
): Promise<string> {
  const results: string[] = [];
  results.push(`Initial: ${await processData(dataId, 1000, 2)}`);
  if (patched('add-validation-step'))
    results.push(
      dataId.trim() !== '' && dataId.length <= 100
        ? 'Validation: passed'
        : 'Validation failed: invalid data',
    );
  results.push(`Common: ${await processData(`${dataId}-common`, 1500, 3)}`);
  if (patched('enhanced-processing')) {
    const transformedData = `transformed_${dataId}_${Date.now()}`;
    const checksum = [...transformedData].reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    );
    results.push(`Enhanced: ${transformedData} (checksum: ${checksum})`);
  } else results.push(`Simple: ${dataId}_processed`);
  if (patched('final-step'))
    results.push(`Final: ${await processData(`${dataId}-final`, 2000, 1)}`);
  if (patched('old-feature')) {
    deprecatePatch('old-feature');
    results.push('Old feature executed (deprecated)');
  }
  const versionInfo = [
    patched('add-validation-step') ? 'validation' : 'no-validation',
    patched('enhanced-processing') ? 'enhanced' : 'simple',
    patched('final-step') ? 'final-step' : 'no-final-step',
    patched('old-feature') ? 'old-feature' : 'no-old-feature',
  ].join(', ');
  return `PATCH WORKFLOW SUCCESS (${versionInfo}): ${results.join(' | ')}`;
}
