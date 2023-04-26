import { createPromiseClient } from '@bufbuild/connect';
import { uiServerTransport } from './transport';
import { WorkflowService } from '@buf/temporal_frontend-api.bufbuild_connect-es/temporal/api/workflowservice/v1/service_connect';

export const UIServiceClient = createPromiseClient(
  WorkflowService,
  uiServerTransport,
);
