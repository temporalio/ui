import { translate } from '$lib/i18n/translate';
import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';
import type { SearchAttributes } from '$lib/types/workflows';
import { formatSDKName } from '$lib/utilities/get-sdk-version';
import { getWorkerHostName } from '$lib/utilities/get-worker-host-name';
import { getColumnFilter } from '$lib/utilities/query/quick-filter-table';
import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';
import type { TableSortColumn } from '$lib/utilities/table-sort';

type WorkerColumn = TableSortColumn<WorkerListInfo | WorkerHeartbeat> & {
  label: string;
  attribute?: string;
};

export const getWorkerColumns = (): WorkerColumn[] => [
  {
    label: translate('workers.status'),
    attribute: 'WorkerStatus',
    getValue: (worker) => toWorkerStatusReadable(worker.status),
    type: 'string',
  },
  {
    label: translate('workers.instance', { count: 1 }),
    attribute: 'WorkerInstanceKey',
    getValue: (worker) => worker.workerInstanceKey,
    type: 'string',
  },
  {
    label: translate('deployments.deployment'),
    attribute: 'DeploymentName',
    getValue: (worker) => worker.deploymentVersion?.deploymentName,
    type: 'string',
  },
  {
    label: translate('deployments.build-id'),
    attribute: 'BuildId',
    getValue: (worker) => worker.deploymentVersion?.buildId,
    type: 'string',
  },
  {
    label: translate('workers.task-queue'),
    attribute: 'TaskQueue',
    getValue: (worker) => worker.taskQueue,
    type: 'string',
  },
  {
    label: translate('workers.identity'),
    attribute: 'WorkerIdentity',
    getValue: (worker) => worker.workerIdentity,
    type: 'string',
  },
  {
    label: translate('workers.host-name'),
    attribute: 'HostName',
    getValue: getWorkerHostName,
    type: 'string',
  },
  {
    label: translate('common.start-time'),
    attribute: 'StartTime',
    getValue: (worker) => worker.startTime,
    type: 'datetime',
  },
  {
    label: translate('workers.sdk'),
    getValue: (worker) =>
      worker.sdkName
        ? `${formatSDKName(worker.sdkName)} ${worker.sdkVersion ?? ''}`.trim()
        : undefined,
    type: 'string',
  },
];

export const getWorkerColumnAttributes = (
  columns: WorkerColumn[],
): Record<string, string> =>
  Object.fromEntries(
    columns.flatMap(({ label, attribute }) =>
      attribute ? [[label, attribute]] : [],
    ),
  );

export const getWorkerColumnFilter = (
  label: string,
  attributes: SearchAttributes,
  columnAttributes: Record<string, string> = getWorkerColumnAttributes(
    getWorkerColumns(),
  ),
) => getColumnFilter({ attributes: columnAttributes }, label, attributes);
