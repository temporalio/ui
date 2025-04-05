import type { WorkflowExecution } from '@temporalio/common';

import { stringifyWithBigInt } from './parse-with-big-int';

export const exportWorkflows = (workflows: WorkflowExecution[]) => {
  const content = stringifyWithBigInt({ workflows }, null, 2);
  download(
    content,
    `workflows-${workflows?.length}-${Date.now()}.json`,
    'text/plain',
  );

  function download(content: string, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
};
