import type { WorkflowExecution } from '@temporalio/common';

import type { DescribeNamespaceResponse } from '$lib/types';

import { stringifyWithBigInt } from './parse-with-big-int';

export const exportWorkflows = (
  workflows: WorkflowExecution[],
  page: number,
  namespaceDetails?: DescribeNamespaceResponse,
) => {
  const exportData = {
    workflows,
    namespace: namespaceDetails
      ? {
          name: namespaceDetails.namespaceInfo?.name,
          tags: namespaceDetails.namespaceInfo?.data || {},
          description: namespaceDetails.namespaceInfo?.description,
          id: namespaceDetails.namespaceInfo?.id,
        }
      : undefined,
    exportedAt: new Date().toISOString(),
    totalWorkflows: workflows.length,
    page,
  };

  const content = stringifyWithBigInt(exportData, null, 2);
  const fileName = `workflows-${workflows.length}-${page}-${Date.now()}.json`;
  download(content, fileName, 'text/plain');

  function download(content: string, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
};
