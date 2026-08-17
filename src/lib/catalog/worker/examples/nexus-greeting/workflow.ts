import { createNexusServiceClient } from '@temporalio/workflow';

import { greetingEndpoint, greetingService } from './service.js';

export async function nexusGreeting(name = 'Temporal'): Promise<string> {
  const nexusClient = createNexusServiceClient({
    service: greetingService,
    endpoint: greetingEndpoint,
  });

  return nexusClient.executeOperation(
    greetingService.operations.greet,
    { name },
    { scheduleToCloseTimeout: '10s' },
  );
}
