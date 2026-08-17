import { serviceHandler } from 'nexus-rpc';

import { greetingService } from './service.js';

export const greetingServiceHandler = serviceHandler(greetingService, {
  greet: async (_context, { name }) =>
    `Hello, ${name}, from a Nexus operation!`,
});
