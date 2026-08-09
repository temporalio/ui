import { operation, service } from 'nexus-rpc';

export const greetingEndpoint = 'ui-workflow-catalog';

export const greetingService = service('workflow-catalog-greeting', {
  greet: operation<{ name: string }, string>(),
});
