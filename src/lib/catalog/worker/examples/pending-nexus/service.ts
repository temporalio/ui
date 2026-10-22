import { operation, service } from 'nexus-rpc';

// A dedicated endpoint: failing operations can open the endpoint's circuit
// breaker, which would otherwise block other examples sharing `ui-catalog`.
export const pendingEndpoint = 'ui-catalog-pending-nexus';

export const pendingService = service('catalog-pending', {
  hold: operation<{ label: string }, string>(),
});
