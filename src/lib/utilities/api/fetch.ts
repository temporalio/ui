import createClient from 'openapi-fetch';

import type { paths } from '../../types/temporalio.d.ts';

// Create the openapi-fetch client with proper typing
export const DataClient = createClient<paths>({
  baseUrl: 'https://your-temporal-server', // Update this with your actual server URL
});

/**
 * List workflows in a namespace with optional filtering and pagination
 */
export async function listWorkflows(params: {
  namespace: string;
  pageSize?: number;
  nextPageToken?: string;
  query?: string;
}) {
  const { data, error } = await DataClient.GET(
    '/api/v1/namespaces/{namespace}/workflows',
    {
      params: {
        path: { namespace: params.namespace },
        query: {
          pageSize: params.pageSize,
          nextPageToken: params.nextPageToken,
          query: params.query,
        },
      },
    },
  );

  if (error) {
    throw new Error(
      `Failed to list workflows: ${error.code || 'Unknown error'} - ${error.message || 'No message'}`,
    );
  }

  return data;
}

// DataClient.GET('/api/v1/namespaces/{namespace}', {
//   params: {
//     path: {
//       namespace: 'string',
//     },
//   },
// });

/**
 * Example usage:
 *
 * // List all workflows in a namespace
 * const workflows = await listWorkflows({
 *   namespace: "default",
 * });
 *
 * // List workflows with pagination
 * const paginatedWorkflows = await listWorkflows({
 *   namespace: "default",
 *   pageSize: 10,
 *   nextPageToken: "next-token-here",
 * });
 *
 * // List workflows with filtering
 * const filteredWorkflows = await listWorkflows({
 *   namespace: "default",
 *   query: "WorkflowType='my-workflow-type'",
 * });
 */
