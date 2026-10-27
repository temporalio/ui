import { serviceHandler } from 'nexus-rpc';

import { featureTourService } from './service.js';

export const featureTourServiceHandler = serviceHandler(featureTourService, {
  echo: async (_context, { message }) => `Nexus echo: ${message}`,
});
