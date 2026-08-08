import { operation, service, serviceHandler } from 'nexus-rpc';

export const greetingService = service('workflow-catalog-greeting', {
  greet: operation<{ name: string }, string>(),
});

export const greetingServiceHandler = serviceHandler(greetingService, {
  greet: async (_context, { name }) =>
    `Hello, ${name}, from a Nexus operation!`,
});
