import { operation, service } from 'nexus-rpc';

export type SlowGreetingInput = {
  name: string;
  failedAttempts: number;
  completionDelaySeconds: number;
  note?: string;
};

export const slowNexusEndpoint = 'ui-catalog-slow-nexus';

export const slowNexusService = service('catalog-slow-nexus', {
  slowGreeting: operation<SlowGreetingInput, string>(),
});
