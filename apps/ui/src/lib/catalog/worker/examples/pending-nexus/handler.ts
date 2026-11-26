import { HandlerError, serviceHandler } from 'nexus-rpc';

import { pendingService } from './service.js';

export const pendingServiceHandler = serviceHandler(pendingService, {
  hold: async (_context, { label }) => {
    throw new HandlerError(
      'UNAVAILABLE',
      `${label} is held pending so it can be inspected`,
    );
  },
});
