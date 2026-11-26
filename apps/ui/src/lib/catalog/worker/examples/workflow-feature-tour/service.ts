import { operation, service } from 'nexus-rpc';

export const featureTourEndpoint = 'ui-catalog';

export const featureTourService = service('catalog-feature-tour', {
  echo: operation<{ message: string }, string>(),
});
