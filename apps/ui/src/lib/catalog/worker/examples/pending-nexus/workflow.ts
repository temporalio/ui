import { createNexusServiceClient } from '@temporalio/workflow';

import { pendingEndpoint, pendingService } from './service.js';

export async function pendingNexus(operationCount = 3): Promise<string[]> {
  const nexusClient = createNexusServiceClient({
    service: pendingService,
    endpoint: pendingEndpoint,
  });

  return Promise.all(
    Array.from({ length: operationCount }, (_, index) =>
      nexusClient.executeOperation(pendingService.operations.hold, {
        label: `operation-${index + 1}`,
      }),
    ),
  );
}
