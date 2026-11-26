import { operation, service } from 'nexus-rpc';

export const greetingEndpoint = 'ui-catalog';

export const greetingService = service('catalog-greeting', {
  greet: operation<{ name: string }, string>(),
});
