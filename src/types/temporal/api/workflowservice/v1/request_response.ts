/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  ArchivalState,
  archivalStateFromJSON,
  archivalStateToJSON,
} from '../../../../temporal/api/enums/v1/namespace';
import {
  WorkflowIdReusePolicy,
  HistoryEventFilterType,
  workflowIdReusePolicyFromJSON,
  workflowIdReusePolicyToJSON,
  historyEventFilterTypeFromJSON,
  historyEventFilterTypeToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import {
  WorkflowTaskFailedCause,
  workflowTaskFailedCauseFromJSON,
  workflowTaskFailedCauseToJSON,
} from '../../../../temporal/api/enums/v1/failed_cause';
import {
  ResetReapplyType,
  resetReapplyTypeFromJSON,
  resetReapplyTypeToJSON,
} from '../../../../temporal/api/enums/v1/reset';
import {
  IndexedValueType,
  indexedValueTypeToJSON,
  indexedValueTypeFromJSON,
} from '../../../../temporal/api/enums/v1/common';
import {
  QueryResultType,
  QueryRejectCondition,
  queryResultTypeFromJSON,
  queryResultTypeToJSON,
  queryRejectConditionFromJSON,
  queryRejectConditionToJSON,
} from '../../../../temporal/api/enums/v1/query';
import {
  TaskQueueType,
  taskQueueTypeFromJSON,
  taskQueueTypeToJSON,
} from '../../../../temporal/api/enums/v1/task_queue';
import { Timestamp } from '../../../../google/protobuf/timestamp';
import { Duration } from '../../../../google/protobuf/duration';
import {
  ClusterReplicationConfig,
  NamespaceReplicationConfig,
} from '../../../../temporal/api/replication/v1/message';
import {
  NamespaceInfo,
  NamespaceConfig,
  UpdateNamespaceInfo,
} from '../../../../temporal/api/namespace/v1/message';
import {
  WorkflowType,
  Payloads,
  RetryPolicy,
  Memo,
  SearchAttributes,
  Header,
  WorkflowExecution,
  DataBlob,
  ActivityType,
} from '../../../../temporal/api/common/v1/message';
import {
  TaskQueue,
  StickyExecutionAttributes,
  TaskQueueMetadata,
  PollerInfo,
  TaskQueueStatus,
  TaskQueuePartitionMetadata,
} from '../../../../temporal/api/taskqueue/v1/message';
import { History } from '../../../../temporal/api/history/v1/message';
import {
  WorkflowQuery,
  WorkflowQueryResult,
  QueryRejected,
} from '../../../../temporal/api/query/v1/message';
import { Command } from '../../../../temporal/api/command/v1/message';
import { Failure } from '../../../../temporal/api/failure/v1/message';
import {
  StartTimeFilter,
  WorkflowExecutionFilter,
  WorkflowTypeFilter,
  StatusFilter,
} from '../../../../temporal/api/filter/v1/message';
import {
  WorkflowExecutionInfo,
  WorkflowExecutionConfig,
  PendingActivityInfo,
  PendingChildExecutionInfo,
} from '../../../../temporal/api/workflow/v1/message';
import { VersionInfo } from '../../../../temporal/api/version/v1/message';

export const protobufPackage = 'temporal.api.workflowservice.v1';

export interface RegisterNamespaceRequest {
  namespace: string;
  description: string;
  ownerEmail: string;
  workflowExecutionRetentionPeriod: Duration | undefined;
  clusters: ClusterReplicationConfig[];
  activeClusterName: string;
  /** A key-value map for any customized purpose. */
  data: { [key: string]: string };
  securityToken: string;
  isGlobalNamespace: boolean;
  /** If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used. */
  historyArchivalState: ArchivalState;
  historyArchivalUri: string;
  /** If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used. */
  visibilityArchivalState: ArchivalState;
  visibilityArchivalUri: string;
}

export interface RegisterNamespaceRequest_DataEntry {
  key: string;
  value: string;
}

export interface RegisterNamespaceResponse {}

export interface ListNamespacesRequest {
  pageSize: number;
  nextPageToken: Uint8Array;
}

export interface ListNamespacesResponse {
  namespaces: DescribeNamespaceResponse[];
  nextPageToken: Uint8Array;
}

export interface DescribeNamespaceRequest {
  namespace: string;
  id: string;
}

export interface DescribeNamespaceResponse {
  namespaceInfo: NamespaceInfo | undefined;
  config: NamespaceConfig | undefined;
  replicationConfig: NamespaceReplicationConfig | undefined;
  failoverVersion: number;
  isGlobalNamespace: boolean;
}

/**
 * (-- api-linter: core::0134::request-mask-required=disabled
 *     aip.dev/not-precedent: UpdateNamespace RPC doesn't follow Google API format. --)
 * (-- api-linter: core::0134::request-resource-required=disabled
 *     aip.dev/not-precedent: UpdateNamespace RPC doesn't follow Google API format. --)
 */
export interface UpdateNamespaceRequest {
  namespace: string;
  updateInfo: UpdateNamespaceInfo | undefined;
  config: NamespaceConfig | undefined;
  replicationConfig: NamespaceReplicationConfig | undefined;
  securityToken: string;
  deleteBadBinary: string;
}

export interface UpdateNamespaceResponse {
  namespaceInfo: NamespaceInfo | undefined;
  config: NamespaceConfig | undefined;
  replicationConfig: NamespaceReplicationConfig | undefined;
  failoverVersion: number;
  isGlobalNamespace: boolean;
}

export interface DeprecateNamespaceRequest {
  namespace: string;
  securityToken: string;
}

export interface DeprecateNamespaceResponse {}

export interface StartWorkflowExecutionRequest {
  namespace: string;
  workflowId: string;
  workflowType: WorkflowType | undefined;
  taskQueue: TaskQueue | undefined;
  input: Payloads | undefined;
  /** Total workflow execution timeout including retries and continue as new. */
  workflowExecutionTimeout: Duration | undefined;
  /** Timeout of a single workflow run. */
  workflowRunTimeout: Duration | undefined;
  /** Timeout of a single workflow task. */
  workflowTaskTimeout: Duration | undefined;
  identity: string;
  requestId: string;
  /** Default: WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE. */
  workflowIdReusePolicy: WorkflowIdReusePolicy;
  /** Retries up to workflow_execution_timeout_seconds. */
  retryPolicy: RetryPolicy | undefined;
  cronSchedule: string;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
  header: Header | undefined;
}

export interface StartWorkflowExecutionResponse {
  runId: string;
}

export interface GetWorkflowExecutionHistoryRequest {
  namespace: string;
  execution: WorkflowExecution | undefined;
  maximumPageSize: number;
  nextPageToken: Uint8Array;
  waitNewEvent: boolean;
  /** Default: HISTORY_EVENT_FILTER_TYPE_ALL_EVENT. */
  historyEventFilterType: HistoryEventFilterType;
  skipArchival: boolean;
}

export interface GetWorkflowExecutionHistoryResponse {
  history: History | undefined;
  rawHistory: DataBlob[];
  nextPageToken: Uint8Array;
  archived: boolean;
}

export interface PollWorkflowTaskQueueRequest {
  namespace: string;
  taskQueue: TaskQueue | undefined;
  identity: string;
  binaryChecksum: string;
}

export interface PollWorkflowTaskQueueResponse {
  taskToken: Uint8Array;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  previousStartedEventId: number;
  startedEventId: number;
  attempt: number;
  backlogCountHint: number;
  history: History | undefined;
  nextPageToken: Uint8Array;
  query: WorkflowQuery | undefined;
  workflowExecutionTaskQueue: TaskQueue | undefined;
  scheduledTime: Date | undefined;
  startedTime: Date | undefined;
  queries: { [key: string]: WorkflowQuery };
}

export interface PollWorkflowTaskQueueResponse_QueriesEntry {
  key: string;
  value: WorkflowQuery | undefined;
}

export interface RespondWorkflowTaskCompletedRequest {
  taskToken: Uint8Array;
  commands: Command[];
  identity: string;
  stickyAttributes: StickyExecutionAttributes | undefined;
  returnNewWorkflowTask: boolean;
  forceCreateNewWorkflowTask: boolean;
  binaryChecksum: string;
  queryResults: { [key: string]: WorkflowQueryResult };
  namespace: string;
}

export interface RespondWorkflowTaskCompletedRequest_QueryResultsEntry {
  key: string;
  value: WorkflowQueryResult | undefined;
}

export interface RespondWorkflowTaskCompletedResponse {
  workflowTask: PollWorkflowTaskQueueResponse | undefined;
}

export interface RespondWorkflowTaskFailedRequest {
  taskToken: Uint8Array;
  cause: WorkflowTaskFailedCause;
  failure: Failure | undefined;
  identity: string;
  binaryChecksum: string;
  namespace: string;
}

export interface RespondWorkflowTaskFailedResponse {}

export interface PollActivityTaskQueueRequest {
  namespace: string;
  taskQueue: TaskQueue | undefined;
  identity: string;
  taskQueueMetadata: TaskQueueMetadata | undefined;
}

export interface PollActivityTaskQueueResponse {
  taskToken: Uint8Array;
  workflowNamespace: string;
  workflowType: WorkflowType | undefined;
  workflowExecution: WorkflowExecution | undefined;
  activityType: ActivityType | undefined;
  activityId: string;
  header: Header | undefined;
  input: Payloads | undefined;
  heartbeatDetails: Payloads | undefined;
  scheduledTime: Date | undefined;
  currentAttemptScheduledTime: Date | undefined;
  startedTime: Date | undefined;
  attempt: number;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  scheduleToCloseTimeout: Duration | undefined;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToCloseTimeout: Duration | undefined;
  heartbeatTimeout: Duration | undefined;
  /**
   * This is an actual retry policy the service uses.
   * It can be different from the one provided (or not) during activity scheduling
   * as the service can override the provided one in case its values are not specified
   * or exceed configured system limits.
   */
  retryPolicy: RetryPolicy | undefined;
}

export interface RecordActivityTaskHeartbeatRequest {
  taskToken: Uint8Array;
  details: Payloads | undefined;
  identity: string;
  namespace: string;
}

export interface RecordActivityTaskHeartbeatResponse {
  cancelRequested: boolean;
}

export interface RecordActivityTaskHeartbeatByIdRequest {
  namespace: string;
  workflowId: string;
  runId: string;
  activityId: string;
  details: Payloads | undefined;
  identity: string;
}

export interface RecordActivityTaskHeartbeatByIdResponse {
  cancelRequested: boolean;
}

export interface RespondActivityTaskCompletedRequest {
  taskToken: Uint8Array;
  result: Payloads | undefined;
  identity: string;
  namespace: string;
}

export interface RespondActivityTaskCompletedResponse {}

export interface RespondActivityTaskCompletedByIdRequest {
  namespace: string;
  workflowId: string;
  runId: string;
  activityId: string;
  result: Payloads | undefined;
  identity: string;
}

export interface RespondActivityTaskCompletedByIdResponse {}

export interface RespondActivityTaskFailedRequest {
  taskToken: Uint8Array;
  failure: Failure | undefined;
  identity: string;
  namespace: string;
}

export interface RespondActivityTaskFailedResponse {}

export interface RespondActivityTaskFailedByIdRequest {
  namespace: string;
  workflowId: string;
  runId: string;
  activityId: string;
  failure: Failure | undefined;
  identity: string;
}

export interface RespondActivityTaskFailedByIdResponse {}

export interface RespondActivityTaskCanceledRequest {
  taskToken: Uint8Array;
  details: Payloads | undefined;
  identity: string;
  namespace: string;
}

export interface RespondActivityTaskCanceledResponse {}

export interface RespondActivityTaskCanceledByIdRequest {
  namespace: string;
  workflowId: string;
  runId: string;
  activityId: string;
  details: Payloads | undefined;
  identity: string;
}

export interface RespondActivityTaskCanceledByIdResponse {}

export interface RequestCancelWorkflowExecutionRequest {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  identity: string;
  requestId: string;
  firstExecutionRunId: string;
}

export interface RequestCancelWorkflowExecutionResponse {}

export interface SignalWorkflowExecutionRequest {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  signalName: string;
  input: Payloads | undefined;
  identity: string;
  requestId: string;
  control: string;
}

export interface SignalWorkflowExecutionResponse {}

export interface SignalWithStartWorkflowExecutionRequest {
  namespace: string;
  workflowId: string;
  workflowType: WorkflowType | undefined;
  taskQueue: TaskQueue | undefined;
  input: Payloads | undefined;
  /** Total workflow execution timeout including retries and continue as new */
  workflowExecutionTimeout: Duration | undefined;
  /** Timeout of a single workflow run */
  workflowRunTimeout: Duration | undefined;
  /** Timeout of a single workflow task */
  workflowTaskTimeout: Duration | undefined;
  identity: string;
  requestId: string;
  workflowIdReusePolicy: WorkflowIdReusePolicy;
  signalName: string;
  signalInput: Payloads | undefined;
  control: string;
  /** Default: WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE. */
  retryPolicy: RetryPolicy | undefined;
  cronSchedule: string;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
  header: Header | undefined;
}

export interface SignalWithStartWorkflowExecutionResponse {
  runId: string;
}

export interface ResetWorkflowExecutionRequest {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  reason: string;
  workflowTaskFinishEventId: number;
  requestId: string;
  resetReapplyType: ResetReapplyType;
}

export interface ResetWorkflowExecutionResponse {
  runId: string;
}

export interface TerminateWorkflowExecutionRequest {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  reason: string;
  details: Payloads | undefined;
  identity: string;
  firstExecutionRunId: string;
}

export interface TerminateWorkflowExecutionResponse {}

export interface ListOpenWorkflowExecutionsRequest {
  namespace: string;
  maximumPageSize: number;
  nextPageToken: Uint8Array;
  startTimeFilter: StartTimeFilter | undefined;
  executionFilter: WorkflowExecutionFilter | undefined;
  typeFilter: WorkflowTypeFilter | undefined;
}

export interface ListOpenWorkflowExecutionsResponse {
  executions: WorkflowExecutionInfo[];
  nextPageToken: Uint8Array;
}

export interface ListClosedWorkflowExecutionsRequest {
  namespace: string;
  maximumPageSize: number;
  nextPageToken: Uint8Array;
  startTimeFilter: StartTimeFilter | undefined;
  executionFilter: WorkflowExecutionFilter | undefined;
  typeFilter: WorkflowTypeFilter | undefined;
  statusFilter: StatusFilter | undefined;
}

export interface ListClosedWorkflowExecutionsResponse {
  executions: WorkflowExecutionInfo[];
  nextPageToken: Uint8Array;
}

export interface ListWorkflowExecutionsRequest {
  namespace: string;
  pageSize: number;
  nextPageToken: Uint8Array;
  query: string;
}

export interface ListWorkflowExecutionsResponse {
  executions: WorkflowExecutionInfo[];
  nextPageToken: Uint8Array;
}

export interface ListArchivedWorkflowExecutionsRequest {
  namespace: string;
  pageSize: number;
  nextPageToken: Uint8Array;
  query: string;
}

export interface ListArchivedWorkflowExecutionsResponse {
  executions: WorkflowExecutionInfo[];
  nextPageToken: Uint8Array;
}

export interface ScanWorkflowExecutionsRequest {
  namespace: string;
  pageSize: number;
  nextPageToken: Uint8Array;
  query: string;
}

export interface ScanWorkflowExecutionsResponse {
  executions: WorkflowExecutionInfo[];
  nextPageToken: Uint8Array;
}

export interface CountWorkflowExecutionsRequest {
  namespace: string;
  query: string;
}

export interface CountWorkflowExecutionsResponse {
  count: number;
}

export interface GetSearchAttributesRequest {}

export interface GetSearchAttributesResponse {
  keys: { [key: string]: IndexedValueType };
}

export interface GetSearchAttributesResponse_KeysEntry {
  key: string;
  value: IndexedValueType;
}

/** TODO:  deprecated APIs */
export interface RespondQueryTaskCompletedRequest {
  taskToken: Uint8Array;
  completedType: QueryResultType;
  queryResult: Payloads | undefined;
  errorMessage: string;
  namespace: string;
}

export interface RespondQueryTaskCompletedResponse {}

export interface ResetStickyTaskQueueRequest {
  namespace: string;
  execution: WorkflowExecution | undefined;
}

export interface ResetStickyTaskQueueResponse {}

export interface QueryWorkflowRequest {
  namespace: string;
  execution: WorkflowExecution | undefined;
  query: WorkflowQuery | undefined;
  /**
   * QueryRejectCondition can used to reject the query if workflow state does not satisfy condition.
   * Default: QUERY_REJECT_CONDITION_NONE.
   */
  queryRejectCondition: QueryRejectCondition;
}

export interface QueryWorkflowResponse {
  queryResult: Payloads | undefined;
  queryRejected: QueryRejected | undefined;
}

export interface DescribeWorkflowExecutionRequest {
  namespace: string;
  execution: WorkflowExecution | undefined;
}

export interface DescribeWorkflowExecutionResponse {
  executionConfig: WorkflowExecutionConfig | undefined;
  workflowExecutionInfo: WorkflowExecutionInfo | undefined;
  pendingActivities: PendingActivityInfo[];
  pendingChildren: PendingChildExecutionInfo[];
}

export interface DescribeTaskQueueRequest {
  namespace: string;
  taskQueue: TaskQueue | undefined;
  taskQueueType: TaskQueueType;
  includeTaskQueueStatus: boolean;
}

export interface DescribeTaskQueueResponse {
  pollers: PollerInfo[];
  taskQueueStatus: TaskQueueStatus | undefined;
}

export interface GetClusterInfoRequest {}

/** GetClusterInfoResponse contains information about Temporal cluster. */
export interface GetClusterInfoResponse {
  /**
   * Key is client name i.e "temporal-go", "temporal-java", or "temporal-cli".
   * Value is ranges of supported versions of this client i.e ">1.1.1 <=1.4.0 || ^5.0.0".
   */
  supportedClients: { [key: string]: string };
  serverVersion: string;
  clusterId: string;
  versionInfo: VersionInfo | undefined;
  clusterName: string;
  historyShardCount: number;
}

export interface GetClusterInfoResponse_SupportedClientsEntry {
  key: string;
  value: string;
}

export interface ListTaskQueuePartitionsRequest {
  namespace: string;
  taskQueue: TaskQueue | undefined;
}

export interface ListTaskQueuePartitionsResponse {
  activityTaskQueuePartitions: TaskQueuePartitionMetadata[];
  workflowTaskQueuePartitions: TaskQueuePartitionMetadata[];
}

const baseRegisterNamespaceRequest: object = {
  namespace: '',
  description: '',
  ownerEmail: '',
  activeClusterName: '',
  securityToken: '',
  isGlobalNamespace: false,
  historyArchivalState: 0,
  historyArchivalUri: '',
  visibilityArchivalState: 0,
  visibilityArchivalUri: '',
};

export const RegisterNamespaceRequest = {
  encode(
    message: RegisterNamespaceRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    if (message.ownerEmail !== '') {
      writer.uint32(26).string(message.ownerEmail);
    }
    if (message.workflowExecutionRetentionPeriod !== undefined) {
      Duration.encode(
        message.workflowExecutionRetentionPeriod,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    for (const v of message.clusters) {
      ClusterReplicationConfig.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.activeClusterName !== '') {
      writer.uint32(50).string(message.activeClusterName);
    }
    Object.entries(message.data).forEach(([key, value]) => {
      RegisterNamespaceRequest_DataEntry.encode(
        { key: key as any, value },
        writer.uint32(58).fork(),
      ).ldelim();
    });
    if (message.securityToken !== '') {
      writer.uint32(66).string(message.securityToken);
    }
    if (message.isGlobalNamespace === true) {
      writer.uint32(72).bool(message.isGlobalNamespace);
    }
    if (message.historyArchivalState !== 0) {
      writer.uint32(80).int32(message.historyArchivalState);
    }
    if (message.historyArchivalUri !== '') {
      writer.uint32(90).string(message.historyArchivalUri);
    }
    if (message.visibilityArchivalState !== 0) {
      writer.uint32(96).int32(message.visibilityArchivalState);
    }
    if (message.visibilityArchivalUri !== '') {
      writer.uint32(106).string(message.visibilityArchivalUri);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RegisterNamespaceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRegisterNamespaceRequest,
    } as RegisterNamespaceRequest;
    message.clusters = [];
    message.data = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.ownerEmail = reader.string();
          break;
        case 4:
          message.workflowExecutionRetentionPeriod = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.clusters.push(
            ClusterReplicationConfig.decode(reader, reader.uint32()),
          );
          break;
        case 6:
          message.activeClusterName = reader.string();
          break;
        case 7:
          const entry7 = RegisterNamespaceRequest_DataEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry7.value !== undefined) {
            message.data[entry7.key] = entry7.value;
          }
          break;
        case 8:
          message.securityToken = reader.string();
          break;
        case 9:
          message.isGlobalNamespace = reader.bool();
          break;
        case 10:
          message.historyArchivalState = reader.int32() as any;
          break;
        case 11:
          message.historyArchivalUri = reader.string();
          break;
        case 12:
          message.visibilityArchivalState = reader.int32() as any;
          break;
        case 13:
          message.visibilityArchivalUri = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegisterNamespaceRequest {
    const message = {
      ...baseRegisterNamespaceRequest,
    } as RegisterNamespaceRequest;
    message.clusters = [];
    message.data = {};
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = String(object.description);
    } else {
      message.description = '';
    }
    if (object.ownerEmail !== undefined && object.ownerEmail !== null) {
      message.ownerEmail = String(object.ownerEmail);
    } else {
      message.ownerEmail = '';
    }
    if (
      object.workflowExecutionRetentionPeriod !== undefined &&
      object.workflowExecutionRetentionPeriod !== null
    ) {
      message.workflowExecutionRetentionPeriod = Duration.fromJSON(
        object.workflowExecutionRetentionPeriod,
      );
    } else {
      message.workflowExecutionRetentionPeriod = undefined;
    }
    if (object.clusters !== undefined && object.clusters !== null) {
      for (const e of object.clusters) {
        message.clusters.push(ClusterReplicationConfig.fromJSON(e));
      }
    }
    if (
      object.activeClusterName !== undefined &&
      object.activeClusterName !== null
    ) {
      message.activeClusterName = String(object.activeClusterName);
    } else {
      message.activeClusterName = '';
    }
    if (object.data !== undefined && object.data !== null) {
      Object.entries(object.data).forEach(([key, value]) => {
        message.data[key] = String(value);
      });
    }
    if (object.securityToken !== undefined && object.securityToken !== null) {
      message.securityToken = String(object.securityToken);
    } else {
      message.securityToken = '';
    }
    if (
      object.isGlobalNamespace !== undefined &&
      object.isGlobalNamespace !== null
    ) {
      message.isGlobalNamespace = Boolean(object.isGlobalNamespace);
    } else {
      message.isGlobalNamespace = false;
    }
    if (
      object.historyArchivalState !== undefined &&
      object.historyArchivalState !== null
    ) {
      message.historyArchivalState = archivalStateFromJSON(
        object.historyArchivalState,
      );
    } else {
      message.historyArchivalState = 0;
    }
    if (
      object.historyArchivalUri !== undefined &&
      object.historyArchivalUri !== null
    ) {
      message.historyArchivalUri = String(object.historyArchivalUri);
    } else {
      message.historyArchivalUri = '';
    }
    if (
      object.visibilityArchivalState !== undefined &&
      object.visibilityArchivalState !== null
    ) {
      message.visibilityArchivalState = archivalStateFromJSON(
        object.visibilityArchivalState,
      );
    } else {
      message.visibilityArchivalState = 0;
    }
    if (
      object.visibilityArchivalUri !== undefined &&
      object.visibilityArchivalUri !== null
    ) {
      message.visibilityArchivalUri = String(object.visibilityArchivalUri);
    } else {
      message.visibilityArchivalUri = '';
    }
    return message;
  },

  toJSON(message: RegisterNamespaceRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.description !== undefined &&
      (obj.description = message.description);
    message.ownerEmail !== undefined && (obj.ownerEmail = message.ownerEmail);
    message.workflowExecutionRetentionPeriod !== undefined &&
      (obj.workflowExecutionRetentionPeriod =
        message.workflowExecutionRetentionPeriod
          ? Duration.toJSON(message.workflowExecutionRetentionPeriod)
          : undefined);
    if (message.clusters) {
      obj.clusters = message.clusters.map((e) =>
        e ? ClusterReplicationConfig.toJSON(e) : undefined,
      );
    } else {
      obj.clusters = [];
    }
    message.activeClusterName !== undefined &&
      (obj.activeClusterName = message.activeClusterName);
    obj.data = {};
    if (message.data) {
      Object.entries(message.data).forEach(([k, v]) => {
        obj.data[k] = v;
      });
    }
    message.securityToken !== undefined &&
      (obj.securityToken = message.securityToken);
    message.isGlobalNamespace !== undefined &&
      (obj.isGlobalNamespace = message.isGlobalNamespace);
    message.historyArchivalState !== undefined &&
      (obj.historyArchivalState = archivalStateToJSON(
        message.historyArchivalState,
      ));
    message.historyArchivalUri !== undefined &&
      (obj.historyArchivalUri = message.historyArchivalUri);
    message.visibilityArchivalState !== undefined &&
      (obj.visibilityArchivalState = archivalStateToJSON(
        message.visibilityArchivalState,
      ));
    message.visibilityArchivalUri !== undefined &&
      (obj.visibilityArchivalUri = message.visibilityArchivalUri);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RegisterNamespaceRequest>,
  ): RegisterNamespaceRequest {
    const message = {
      ...baseRegisterNamespaceRequest,
    } as RegisterNamespaceRequest;
    message.clusters = [];
    message.data = {};
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    } else {
      message.description = '';
    }
    if (object.ownerEmail !== undefined && object.ownerEmail !== null) {
      message.ownerEmail = object.ownerEmail;
    } else {
      message.ownerEmail = '';
    }
    if (
      object.workflowExecutionRetentionPeriod !== undefined &&
      object.workflowExecutionRetentionPeriod !== null
    ) {
      message.workflowExecutionRetentionPeriod = Duration.fromPartial(
        object.workflowExecutionRetentionPeriod,
      );
    } else {
      message.workflowExecutionRetentionPeriod = undefined;
    }
    if (object.clusters !== undefined && object.clusters !== null) {
      for (const e of object.clusters) {
        message.clusters.push(ClusterReplicationConfig.fromPartial(e));
      }
    }
    if (
      object.activeClusterName !== undefined &&
      object.activeClusterName !== null
    ) {
      message.activeClusterName = object.activeClusterName;
    } else {
      message.activeClusterName = '';
    }
    if (object.data !== undefined && object.data !== null) {
      Object.entries(object.data).forEach(([key, value]) => {
        if (value !== undefined) {
          message.data[key] = String(value);
        }
      });
    }
    if (object.securityToken !== undefined && object.securityToken !== null) {
      message.securityToken = object.securityToken;
    } else {
      message.securityToken = '';
    }
    if (
      object.isGlobalNamespace !== undefined &&
      object.isGlobalNamespace !== null
    ) {
      message.isGlobalNamespace = object.isGlobalNamespace;
    } else {
      message.isGlobalNamespace = false;
    }
    if (
      object.historyArchivalState !== undefined &&
      object.historyArchivalState !== null
    ) {
      message.historyArchivalState = object.historyArchivalState;
    } else {
      message.historyArchivalState = 0;
    }
    if (
      object.historyArchivalUri !== undefined &&
      object.historyArchivalUri !== null
    ) {
      message.historyArchivalUri = object.historyArchivalUri;
    } else {
      message.historyArchivalUri = '';
    }
    if (
      object.visibilityArchivalState !== undefined &&
      object.visibilityArchivalState !== null
    ) {
      message.visibilityArchivalState = object.visibilityArchivalState;
    } else {
      message.visibilityArchivalState = 0;
    }
    if (
      object.visibilityArchivalUri !== undefined &&
      object.visibilityArchivalUri !== null
    ) {
      message.visibilityArchivalUri = object.visibilityArchivalUri;
    } else {
      message.visibilityArchivalUri = '';
    }
    return message;
  },
};

const baseRegisterNamespaceRequest_DataEntry: object = { key: '', value: '' };

export const RegisterNamespaceRequest_DataEntry = {
  encode(
    message: RegisterNamespaceRequest_DataEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RegisterNamespaceRequest_DataEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRegisterNamespaceRequest_DataEntry,
    } as RegisterNamespaceRequest_DataEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegisterNamespaceRequest_DataEntry {
    const message = {
      ...baseRegisterNamespaceRequest_DataEntry,
    } as RegisterNamespaceRequest_DataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = String(object.value);
    } else {
      message.value = '';
    }
    return message;
  },

  toJSON(message: RegisterNamespaceRequest_DataEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RegisterNamespaceRequest_DataEntry>,
  ): RegisterNamespaceRequest_DataEntry {
    const message = {
      ...baseRegisterNamespaceRequest_DataEntry,
    } as RegisterNamespaceRequest_DataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = '';
    }
    return message;
  },
};

const baseRegisterNamespaceResponse: object = {};

export const RegisterNamespaceResponse = {
  encode(
    _: RegisterNamespaceResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RegisterNamespaceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRegisterNamespaceResponse,
    } as RegisterNamespaceResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RegisterNamespaceResponse {
    const message = {
      ...baseRegisterNamespaceResponse,
    } as RegisterNamespaceResponse;
    return message;
  },

  toJSON(_: RegisterNamespaceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RegisterNamespaceResponse>,
  ): RegisterNamespaceResponse {
    const message = {
      ...baseRegisterNamespaceResponse,
    } as RegisterNamespaceResponse;
    return message;
  },
};

const baseListNamespacesRequest: object = { pageSize: 0 };

export const ListNamespacesRequest = {
  encode(
    message: ListNamespacesRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.pageSize !== 0) {
      writer.uint32(8).int32(message.pageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListNamespacesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseListNamespacesRequest } as ListNamespacesRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pageSize = reader.int32();
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListNamespacesRequest {
    const message = { ...baseListNamespacesRequest } as ListNamespacesRequest;
    message.nextPageToken = new Uint8Array();
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = Number(object.pageSize);
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ListNamespacesRequest): unknown {
    const obj: any = {};
    message.pageSize !== undefined && (obj.pageSize = message.pageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListNamespacesRequest>,
  ): ListNamespacesRequest {
    const message = { ...baseListNamespacesRequest } as ListNamespacesRequest;
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = object.pageSize;
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseListNamespacesResponse: object = {};

export const ListNamespacesResponse = {
  encode(
    message: ListNamespacesResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.namespaces) {
      DescribeNamespaceResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListNamespacesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseListNamespacesResponse } as ListNamespacesResponse;
    message.namespaces = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespaces.push(
            DescribeNamespaceResponse.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListNamespacesResponse {
    const message = { ...baseListNamespacesResponse } as ListNamespacesResponse;
    message.namespaces = [];
    message.nextPageToken = new Uint8Array();
    if (object.namespaces !== undefined && object.namespaces !== null) {
      for (const e of object.namespaces) {
        message.namespaces.push(DescribeNamespaceResponse.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ListNamespacesResponse): unknown {
    const obj: any = {};
    if (message.namespaces) {
      obj.namespaces = message.namespaces.map((e) =>
        e ? DescribeNamespaceResponse.toJSON(e) : undefined,
      );
    } else {
      obj.namespaces = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListNamespacesResponse>,
  ): ListNamespacesResponse {
    const message = { ...baseListNamespacesResponse } as ListNamespacesResponse;
    message.namespaces = [];
    if (object.namespaces !== undefined && object.namespaces !== null) {
      for (const e of object.namespaces) {
        message.namespaces.push(DescribeNamespaceResponse.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseDescribeNamespaceRequest: object = { namespace: '', id: '' };

export const DescribeNamespaceRequest = {
  encode(
    message: DescribeNamespaceRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.id !== '') {
      writer.uint32(18).string(message.id);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DescribeNamespaceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDescribeNamespaceRequest,
    } as DescribeNamespaceRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DescribeNamespaceRequest {
    const message = {
      ...baseDescribeNamespaceRequest,
    } as DescribeNamespaceRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = String(object.id);
    } else {
      message.id = '';
    }
    return message;
  },

  toJSON(message: DescribeNamespaceRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DescribeNamespaceRequest>,
  ): DescribeNamespaceRequest {
    const message = {
      ...baseDescribeNamespaceRequest,
    } as DescribeNamespaceRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = '';
    }
    return message;
  },
};

const baseDescribeNamespaceResponse: object = {
  failoverVersion: 0,
  isGlobalNamespace: false,
};

export const DescribeNamespaceResponse = {
  encode(
    message: DescribeNamespaceResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespaceInfo !== undefined) {
      NamespaceInfo.encode(
        message.namespaceInfo,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.config !== undefined) {
      NamespaceConfig.encode(message.config, writer.uint32(18).fork()).ldelim();
    }
    if (message.replicationConfig !== undefined) {
      NamespaceReplicationConfig.encode(
        message.replicationConfig,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.failoverVersion !== 0) {
      writer.uint32(32).int64(message.failoverVersion);
    }
    if (message.isGlobalNamespace === true) {
      writer.uint32(40).bool(message.isGlobalNamespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DescribeNamespaceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDescribeNamespaceResponse,
    } as DescribeNamespaceResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespaceInfo = NamespaceInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.config = NamespaceConfig.decode(reader, reader.uint32());
          break;
        case 3:
          message.replicationConfig = NamespaceReplicationConfig.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.failoverVersion = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.isGlobalNamespace = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DescribeNamespaceResponse {
    const message = {
      ...baseDescribeNamespaceResponse,
    } as DescribeNamespaceResponse;
    if (object.namespaceInfo !== undefined && object.namespaceInfo !== null) {
      message.namespaceInfo = NamespaceInfo.fromJSON(object.namespaceInfo);
    } else {
      message.namespaceInfo = undefined;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = NamespaceConfig.fromJSON(object.config);
    } else {
      message.config = undefined;
    }
    if (
      object.replicationConfig !== undefined &&
      object.replicationConfig !== null
    ) {
      message.replicationConfig = NamespaceReplicationConfig.fromJSON(
        object.replicationConfig,
      );
    } else {
      message.replicationConfig = undefined;
    }
    if (
      object.failoverVersion !== undefined &&
      object.failoverVersion !== null
    ) {
      message.failoverVersion = Number(object.failoverVersion);
    } else {
      message.failoverVersion = 0;
    }
    if (
      object.isGlobalNamespace !== undefined &&
      object.isGlobalNamespace !== null
    ) {
      message.isGlobalNamespace = Boolean(object.isGlobalNamespace);
    } else {
      message.isGlobalNamespace = false;
    }
    return message;
  },

  toJSON(message: DescribeNamespaceResponse): unknown {
    const obj: any = {};
    message.namespaceInfo !== undefined &&
      (obj.namespaceInfo = message.namespaceInfo
        ? NamespaceInfo.toJSON(message.namespaceInfo)
        : undefined);
    message.config !== undefined &&
      (obj.config = message.config
        ? NamespaceConfig.toJSON(message.config)
        : undefined);
    message.replicationConfig !== undefined &&
      (obj.replicationConfig = message.replicationConfig
        ? NamespaceReplicationConfig.toJSON(message.replicationConfig)
        : undefined);
    message.failoverVersion !== undefined &&
      (obj.failoverVersion = message.failoverVersion);
    message.isGlobalNamespace !== undefined &&
      (obj.isGlobalNamespace = message.isGlobalNamespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DescribeNamespaceResponse>,
  ): DescribeNamespaceResponse {
    const message = {
      ...baseDescribeNamespaceResponse,
    } as DescribeNamespaceResponse;
    if (object.namespaceInfo !== undefined && object.namespaceInfo !== null) {
      message.namespaceInfo = NamespaceInfo.fromPartial(object.namespaceInfo);
    } else {
      message.namespaceInfo = undefined;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = NamespaceConfig.fromPartial(object.config);
    } else {
      message.config = undefined;
    }
    if (
      object.replicationConfig !== undefined &&
      object.replicationConfig !== null
    ) {
      message.replicationConfig = NamespaceReplicationConfig.fromPartial(
        object.replicationConfig,
      );
    } else {
      message.replicationConfig = undefined;
    }
    if (
      object.failoverVersion !== undefined &&
      object.failoverVersion !== null
    ) {
      message.failoverVersion = object.failoverVersion;
    } else {
      message.failoverVersion = 0;
    }
    if (
      object.isGlobalNamespace !== undefined &&
      object.isGlobalNamespace !== null
    ) {
      message.isGlobalNamespace = object.isGlobalNamespace;
    } else {
      message.isGlobalNamespace = false;
    }
    return message;
  },
};

const baseUpdateNamespaceRequest: object = {
  namespace: '',
  securityToken: '',
  deleteBadBinary: '',
};

export const UpdateNamespaceRequest = {
  encode(
    message: UpdateNamespaceRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.updateInfo !== undefined) {
      UpdateNamespaceInfo.encode(
        message.updateInfo,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.config !== undefined) {
      NamespaceConfig.encode(message.config, writer.uint32(26).fork()).ldelim();
    }
    if (message.replicationConfig !== undefined) {
      NamespaceReplicationConfig.encode(
        message.replicationConfig,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.securityToken !== '') {
      writer.uint32(42).string(message.securityToken);
    }
    if (message.deleteBadBinary !== '') {
      writer.uint32(50).string(message.deleteBadBinary);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNamespaceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseUpdateNamespaceRequest } as UpdateNamespaceRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.updateInfo = UpdateNamespaceInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.config = NamespaceConfig.decode(reader, reader.uint32());
          break;
        case 4:
          message.replicationConfig = NamespaceReplicationConfig.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.securityToken = reader.string();
          break;
        case 6:
          message.deleteBadBinary = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateNamespaceRequest {
    const message = { ...baseUpdateNamespaceRequest } as UpdateNamespaceRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.updateInfo !== undefined && object.updateInfo !== null) {
      message.updateInfo = UpdateNamespaceInfo.fromJSON(object.updateInfo);
    } else {
      message.updateInfo = undefined;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = NamespaceConfig.fromJSON(object.config);
    } else {
      message.config = undefined;
    }
    if (
      object.replicationConfig !== undefined &&
      object.replicationConfig !== null
    ) {
      message.replicationConfig = NamespaceReplicationConfig.fromJSON(
        object.replicationConfig,
      );
    } else {
      message.replicationConfig = undefined;
    }
    if (object.securityToken !== undefined && object.securityToken !== null) {
      message.securityToken = String(object.securityToken);
    } else {
      message.securityToken = '';
    }
    if (
      object.deleteBadBinary !== undefined &&
      object.deleteBadBinary !== null
    ) {
      message.deleteBadBinary = String(object.deleteBadBinary);
    } else {
      message.deleteBadBinary = '';
    }
    return message;
  },

  toJSON(message: UpdateNamespaceRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.updateInfo !== undefined &&
      (obj.updateInfo = message.updateInfo
        ? UpdateNamespaceInfo.toJSON(message.updateInfo)
        : undefined);
    message.config !== undefined &&
      (obj.config = message.config
        ? NamespaceConfig.toJSON(message.config)
        : undefined);
    message.replicationConfig !== undefined &&
      (obj.replicationConfig = message.replicationConfig
        ? NamespaceReplicationConfig.toJSON(message.replicationConfig)
        : undefined);
    message.securityToken !== undefined &&
      (obj.securityToken = message.securityToken);
    message.deleteBadBinary !== undefined &&
      (obj.deleteBadBinary = message.deleteBadBinary);
    return obj;
  },

  fromPartial(
    object: DeepPartial<UpdateNamespaceRequest>,
  ): UpdateNamespaceRequest {
    const message = { ...baseUpdateNamespaceRequest } as UpdateNamespaceRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.updateInfo !== undefined && object.updateInfo !== null) {
      message.updateInfo = UpdateNamespaceInfo.fromPartial(object.updateInfo);
    } else {
      message.updateInfo = undefined;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = NamespaceConfig.fromPartial(object.config);
    } else {
      message.config = undefined;
    }
    if (
      object.replicationConfig !== undefined &&
      object.replicationConfig !== null
    ) {
      message.replicationConfig = NamespaceReplicationConfig.fromPartial(
        object.replicationConfig,
      );
    } else {
      message.replicationConfig = undefined;
    }
    if (object.securityToken !== undefined && object.securityToken !== null) {
      message.securityToken = object.securityToken;
    } else {
      message.securityToken = '';
    }
    if (
      object.deleteBadBinary !== undefined &&
      object.deleteBadBinary !== null
    ) {
      message.deleteBadBinary = object.deleteBadBinary;
    } else {
      message.deleteBadBinary = '';
    }
    return message;
  },
};

const baseUpdateNamespaceResponse: object = {
  failoverVersion: 0,
  isGlobalNamespace: false,
};

export const UpdateNamespaceResponse = {
  encode(
    message: UpdateNamespaceResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespaceInfo !== undefined) {
      NamespaceInfo.encode(
        message.namespaceInfo,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.config !== undefined) {
      NamespaceConfig.encode(message.config, writer.uint32(18).fork()).ldelim();
    }
    if (message.replicationConfig !== undefined) {
      NamespaceReplicationConfig.encode(
        message.replicationConfig,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.failoverVersion !== 0) {
      writer.uint32(32).int64(message.failoverVersion);
    }
    if (message.isGlobalNamespace === true) {
      writer.uint32(40).bool(message.isGlobalNamespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNamespaceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseUpdateNamespaceResponse,
    } as UpdateNamespaceResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespaceInfo = NamespaceInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.config = NamespaceConfig.decode(reader, reader.uint32());
          break;
        case 3:
          message.replicationConfig = NamespaceReplicationConfig.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.failoverVersion = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.isGlobalNamespace = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateNamespaceResponse {
    const message = {
      ...baseUpdateNamespaceResponse,
    } as UpdateNamespaceResponse;
    if (object.namespaceInfo !== undefined && object.namespaceInfo !== null) {
      message.namespaceInfo = NamespaceInfo.fromJSON(object.namespaceInfo);
    } else {
      message.namespaceInfo = undefined;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = NamespaceConfig.fromJSON(object.config);
    } else {
      message.config = undefined;
    }
    if (
      object.replicationConfig !== undefined &&
      object.replicationConfig !== null
    ) {
      message.replicationConfig = NamespaceReplicationConfig.fromJSON(
        object.replicationConfig,
      );
    } else {
      message.replicationConfig = undefined;
    }
    if (
      object.failoverVersion !== undefined &&
      object.failoverVersion !== null
    ) {
      message.failoverVersion = Number(object.failoverVersion);
    } else {
      message.failoverVersion = 0;
    }
    if (
      object.isGlobalNamespace !== undefined &&
      object.isGlobalNamespace !== null
    ) {
      message.isGlobalNamespace = Boolean(object.isGlobalNamespace);
    } else {
      message.isGlobalNamespace = false;
    }
    return message;
  },

  toJSON(message: UpdateNamespaceResponse): unknown {
    const obj: any = {};
    message.namespaceInfo !== undefined &&
      (obj.namespaceInfo = message.namespaceInfo
        ? NamespaceInfo.toJSON(message.namespaceInfo)
        : undefined);
    message.config !== undefined &&
      (obj.config = message.config
        ? NamespaceConfig.toJSON(message.config)
        : undefined);
    message.replicationConfig !== undefined &&
      (obj.replicationConfig = message.replicationConfig
        ? NamespaceReplicationConfig.toJSON(message.replicationConfig)
        : undefined);
    message.failoverVersion !== undefined &&
      (obj.failoverVersion = message.failoverVersion);
    message.isGlobalNamespace !== undefined &&
      (obj.isGlobalNamespace = message.isGlobalNamespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<UpdateNamespaceResponse>,
  ): UpdateNamespaceResponse {
    const message = {
      ...baseUpdateNamespaceResponse,
    } as UpdateNamespaceResponse;
    if (object.namespaceInfo !== undefined && object.namespaceInfo !== null) {
      message.namespaceInfo = NamespaceInfo.fromPartial(object.namespaceInfo);
    } else {
      message.namespaceInfo = undefined;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = NamespaceConfig.fromPartial(object.config);
    } else {
      message.config = undefined;
    }
    if (
      object.replicationConfig !== undefined &&
      object.replicationConfig !== null
    ) {
      message.replicationConfig = NamespaceReplicationConfig.fromPartial(
        object.replicationConfig,
      );
    } else {
      message.replicationConfig = undefined;
    }
    if (
      object.failoverVersion !== undefined &&
      object.failoverVersion !== null
    ) {
      message.failoverVersion = object.failoverVersion;
    } else {
      message.failoverVersion = 0;
    }
    if (
      object.isGlobalNamespace !== undefined &&
      object.isGlobalNamespace !== null
    ) {
      message.isGlobalNamespace = object.isGlobalNamespace;
    } else {
      message.isGlobalNamespace = false;
    }
    return message;
  },
};

const baseDeprecateNamespaceRequest: object = {
  namespace: '',
  securityToken: '',
};

export const DeprecateNamespaceRequest = {
  encode(
    message: DeprecateNamespaceRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.securityToken !== '') {
      writer.uint32(18).string(message.securityToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DeprecateNamespaceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDeprecateNamespaceRequest,
    } as DeprecateNamespaceRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.securityToken = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeprecateNamespaceRequest {
    const message = {
      ...baseDeprecateNamespaceRequest,
    } as DeprecateNamespaceRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.securityToken !== undefined && object.securityToken !== null) {
      message.securityToken = String(object.securityToken);
    } else {
      message.securityToken = '';
    }
    return message;
  },

  toJSON(message: DeprecateNamespaceRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.securityToken !== undefined &&
      (obj.securityToken = message.securityToken);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DeprecateNamespaceRequest>,
  ): DeprecateNamespaceRequest {
    const message = {
      ...baseDeprecateNamespaceRequest,
    } as DeprecateNamespaceRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.securityToken !== undefined && object.securityToken !== null) {
      message.securityToken = object.securityToken;
    } else {
      message.securityToken = '';
    }
    return message;
  },
};

const baseDeprecateNamespaceResponse: object = {};

export const DeprecateNamespaceResponse = {
  encode(
    _: DeprecateNamespaceResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DeprecateNamespaceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDeprecateNamespaceResponse,
    } as DeprecateNamespaceResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): DeprecateNamespaceResponse {
    const message = {
      ...baseDeprecateNamespaceResponse,
    } as DeprecateNamespaceResponse;
    return message;
  },

  toJSON(_: DeprecateNamespaceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<DeprecateNamespaceResponse>,
  ): DeprecateNamespaceResponse {
    const message = {
      ...baseDeprecateNamespaceResponse,
    } as DeprecateNamespaceResponse;
    return message;
  },
};

const baseStartWorkflowExecutionRequest: object = {
  namespace: '',
  workflowId: '',
  identity: '',
  requestId: '',
  workflowIdReusePolicy: 0,
  cronSchedule: '',
};

export const StartWorkflowExecutionRequest = {
  encode(
    message: StartWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(34).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(42).fork()).ldelim();
    }
    if (message.workflowExecutionTimeout !== undefined) {
      Duration.encode(
        message.workflowExecutionTimeout,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimeout !== undefined) {
      Duration.encode(
        message.workflowTaskTimeout,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(74).string(message.identity);
    }
    if (message.requestId !== '') {
      writer.uint32(82).string(message.requestId);
    }
    if (message.workflowIdReusePolicy !== 0) {
      writer.uint32(88).int32(message.workflowIdReusePolicy);
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.cronSchedule !== '') {
      writer.uint32(106).string(message.cronSchedule);
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(114).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(122).fork(),
      ).ldelim();
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(130).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StartWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStartWorkflowExecutionRequest,
    } as StartWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 5:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.workflowExecutionTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 8:
          message.workflowTaskTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.identity = reader.string();
          break;
        case 10:
          message.requestId = reader.string();
          break;
        case 11:
          message.workflowIdReusePolicy = reader.int32() as any;
          break;
        case 12:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        case 13:
          message.cronSchedule = reader.string();
          break;
        case 14:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 15:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 16:
          message.header = Header.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartWorkflowExecutionRequest {
    const message = {
      ...baseStartWorkflowExecutionRequest,
    } as StartWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromJSON(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromJSON(object.workflowRunTimeout);
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromJSON(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    if (
      object.workflowIdReusePolicy !== undefined &&
      object.workflowIdReusePolicy !== null
    ) {
      message.workflowIdReusePolicy = workflowIdReusePolicyFromJSON(
        object.workflowIdReusePolicy,
      );
    } else {
      message.workflowIdReusePolicy = 0;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = String(object.cronSchedule);
    } else {
      message.cronSchedule = '';
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromJSON(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromJSON(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },

  toJSON(message: StartWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.workflowExecutionTimeout !== undefined &&
      (obj.workflowExecutionTimeout = message.workflowExecutionTimeout
        ? Duration.toJSON(message.workflowExecutionTimeout)
        : undefined);
    message.workflowRunTimeout !== undefined &&
      (obj.workflowRunTimeout = message.workflowRunTimeout
        ? Duration.toJSON(message.workflowRunTimeout)
        : undefined);
    message.workflowTaskTimeout !== undefined &&
      (obj.workflowTaskTimeout = message.workflowTaskTimeout
        ? Duration.toJSON(message.workflowTaskTimeout)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.workflowIdReusePolicy !== undefined &&
      (obj.workflowIdReusePolicy = workflowIdReusePolicyToJSON(
        message.workflowIdReusePolicy,
      ));
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    message.cronSchedule !== undefined &&
      (obj.cronSchedule = message.cronSchedule);
    message.memo !== undefined &&
      (obj.memo = message.memo ? Memo.toJSON(message.memo) : undefined);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<StartWorkflowExecutionRequest>,
  ): StartWorkflowExecutionRequest {
    const message = {
      ...baseStartWorkflowExecutionRequest,
    } as StartWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromPartial(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromPartial(
        object.workflowRunTimeout,
      );
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromPartial(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    if (
      object.workflowIdReusePolicy !== undefined &&
      object.workflowIdReusePolicy !== null
    ) {
      message.workflowIdReusePolicy = object.workflowIdReusePolicy;
    } else {
      message.workflowIdReusePolicy = 0;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = object.cronSchedule;
    } else {
      message.cronSchedule = '';
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromPartial(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromPartial(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },
};

const baseStartWorkflowExecutionResponse: object = { runId: '' };

export const StartWorkflowExecutionResponse = {
  encode(
    message: StartWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.runId !== '') {
      writer.uint32(10).string(message.runId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StartWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStartWorkflowExecutionResponse,
    } as StartWorkflowExecutionResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.runId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartWorkflowExecutionResponse {
    const message = {
      ...baseStartWorkflowExecutionResponse,
    } as StartWorkflowExecutionResponse;
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    return message;
  },

  toJSON(message: StartWorkflowExecutionResponse): unknown {
    const obj: any = {};
    message.runId !== undefined && (obj.runId = message.runId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<StartWorkflowExecutionResponse>,
  ): StartWorkflowExecutionResponse {
    const message = {
      ...baseStartWorkflowExecutionResponse,
    } as StartWorkflowExecutionResponse;
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    return message;
  },
};

const baseGetWorkflowExecutionHistoryRequest: object = {
  namespace: '',
  maximumPageSize: 0,
  waitNewEvent: false,
  historyEventFilterType: 0,
  skipArchival: false,
};

export const GetWorkflowExecutionHistoryRequest = {
  encode(
    message: GetWorkflowExecutionHistoryRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.execution !== undefined) {
      WorkflowExecution.encode(
        message.execution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.maximumPageSize !== 0) {
      writer.uint32(24).int32(message.maximumPageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(34).bytes(message.nextPageToken);
    }
    if (message.waitNewEvent === true) {
      writer.uint32(40).bool(message.waitNewEvent);
    }
    if (message.historyEventFilterType !== 0) {
      writer.uint32(48).int32(message.historyEventFilterType);
    }
    if (message.skipArchival === true) {
      writer.uint32(56).bool(message.skipArchival);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetWorkflowExecutionHistoryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGetWorkflowExecutionHistoryRequest,
    } as GetWorkflowExecutionHistoryRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.execution = WorkflowExecution.decode(reader, reader.uint32());
          break;
        case 3:
          message.maximumPageSize = reader.int32();
          break;
        case 4:
          message.nextPageToken = reader.bytes();
          break;
        case 5:
          message.waitNewEvent = reader.bool();
          break;
        case 6:
          message.historyEventFilterType = reader.int32() as any;
          break;
        case 7:
          message.skipArchival = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetWorkflowExecutionHistoryRequest {
    const message = {
      ...baseGetWorkflowExecutionHistoryRequest,
    } as GetWorkflowExecutionHistoryRequest;
    message.nextPageToken = new Uint8Array();
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromJSON(object.execution);
    } else {
      message.execution = undefined;
    }
    if (
      object.maximumPageSize !== undefined &&
      object.maximumPageSize !== null
    ) {
      message.maximumPageSize = Number(object.maximumPageSize);
    } else {
      message.maximumPageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (object.waitNewEvent !== undefined && object.waitNewEvent !== null) {
      message.waitNewEvent = Boolean(object.waitNewEvent);
    } else {
      message.waitNewEvent = false;
    }
    if (
      object.historyEventFilterType !== undefined &&
      object.historyEventFilterType !== null
    ) {
      message.historyEventFilterType = historyEventFilterTypeFromJSON(
        object.historyEventFilterType,
      );
    } else {
      message.historyEventFilterType = 0;
    }
    if (object.skipArchival !== undefined && object.skipArchival !== null) {
      message.skipArchival = Boolean(object.skipArchival);
    } else {
      message.skipArchival = false;
    }
    return message;
  },

  toJSON(message: GetWorkflowExecutionHistoryRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.execution !== undefined &&
      (obj.execution = message.execution
        ? WorkflowExecution.toJSON(message.execution)
        : undefined);
    message.maximumPageSize !== undefined &&
      (obj.maximumPageSize = message.maximumPageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.waitNewEvent !== undefined &&
      (obj.waitNewEvent = message.waitNewEvent);
    message.historyEventFilterType !== undefined &&
      (obj.historyEventFilterType = historyEventFilterTypeToJSON(
        message.historyEventFilterType,
      ));
    message.skipArchival !== undefined &&
      (obj.skipArchival = message.skipArchival);
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetWorkflowExecutionHistoryRequest>,
  ): GetWorkflowExecutionHistoryRequest {
    const message = {
      ...baseGetWorkflowExecutionHistoryRequest,
    } as GetWorkflowExecutionHistoryRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromPartial(object.execution);
    } else {
      message.execution = undefined;
    }
    if (
      object.maximumPageSize !== undefined &&
      object.maximumPageSize !== null
    ) {
      message.maximumPageSize = object.maximumPageSize;
    } else {
      message.maximumPageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (object.waitNewEvent !== undefined && object.waitNewEvent !== null) {
      message.waitNewEvent = object.waitNewEvent;
    } else {
      message.waitNewEvent = false;
    }
    if (
      object.historyEventFilterType !== undefined &&
      object.historyEventFilterType !== null
    ) {
      message.historyEventFilterType = object.historyEventFilterType;
    } else {
      message.historyEventFilterType = 0;
    }
    if (object.skipArchival !== undefined && object.skipArchival !== null) {
      message.skipArchival = object.skipArchival;
    } else {
      message.skipArchival = false;
    }
    return message;
  },
};

const baseGetWorkflowExecutionHistoryResponse: object = { archived: false };

export const GetWorkflowExecutionHistoryResponse = {
  encode(
    message: GetWorkflowExecutionHistoryResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.history !== undefined) {
      History.encode(message.history, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.rawHistory) {
      DataBlob.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(26).bytes(message.nextPageToken);
    }
    if (message.archived === true) {
      writer.uint32(32).bool(message.archived);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetWorkflowExecutionHistoryResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGetWorkflowExecutionHistoryResponse,
    } as GetWorkflowExecutionHistoryResponse;
    message.rawHistory = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.history = History.decode(reader, reader.uint32());
          break;
        case 2:
          message.rawHistory.push(DataBlob.decode(reader, reader.uint32()));
          break;
        case 3:
          message.nextPageToken = reader.bytes();
          break;
        case 4:
          message.archived = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetWorkflowExecutionHistoryResponse {
    const message = {
      ...baseGetWorkflowExecutionHistoryResponse,
    } as GetWorkflowExecutionHistoryResponse;
    message.rawHistory = [];
    message.nextPageToken = new Uint8Array();
    if (object.history !== undefined && object.history !== null) {
      message.history = History.fromJSON(object.history);
    } else {
      message.history = undefined;
    }
    if (object.rawHistory !== undefined && object.rawHistory !== null) {
      for (const e of object.rawHistory) {
        message.rawHistory.push(DataBlob.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (object.archived !== undefined && object.archived !== null) {
      message.archived = Boolean(object.archived);
    } else {
      message.archived = false;
    }
    return message;
  },

  toJSON(message: GetWorkflowExecutionHistoryResponse): unknown {
    const obj: any = {};
    message.history !== undefined &&
      (obj.history = message.history
        ? History.toJSON(message.history)
        : undefined);
    if (message.rawHistory) {
      obj.rawHistory = message.rawHistory.map((e) =>
        e ? DataBlob.toJSON(e) : undefined,
      );
    } else {
      obj.rawHistory = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.archived !== undefined && (obj.archived = message.archived);
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetWorkflowExecutionHistoryResponse>,
  ): GetWorkflowExecutionHistoryResponse {
    const message = {
      ...baseGetWorkflowExecutionHistoryResponse,
    } as GetWorkflowExecutionHistoryResponse;
    message.rawHistory = [];
    if (object.history !== undefined && object.history !== null) {
      message.history = History.fromPartial(object.history);
    } else {
      message.history = undefined;
    }
    if (object.rawHistory !== undefined && object.rawHistory !== null) {
      for (const e of object.rawHistory) {
        message.rawHistory.push(DataBlob.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (object.archived !== undefined && object.archived !== null) {
      message.archived = object.archived;
    } else {
      message.archived = false;
    }
    return message;
  },
};

const basePollWorkflowTaskQueueRequest: object = {
  namespace: '',
  identity: '',
  binaryChecksum: '',
};

export const PollWorkflowTaskQueueRequest = {
  encode(
    message: PollWorkflowTaskQueueRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.binaryChecksum !== '') {
      writer.uint32(34).string(message.binaryChecksum);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PollWorkflowTaskQueueRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePollWorkflowTaskQueueRequest,
    } as PollWorkflowTaskQueueRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.binaryChecksum = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PollWorkflowTaskQueueRequest {
    const message = {
      ...basePollWorkflowTaskQueueRequest,
    } as PollWorkflowTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = String(object.binaryChecksum);
    } else {
      message.binaryChecksum = '';
    }
    return message;
  },

  toJSON(message: PollWorkflowTaskQueueRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.binaryChecksum !== undefined &&
      (obj.binaryChecksum = message.binaryChecksum);
    return obj;
  },

  fromPartial(
    object: DeepPartial<PollWorkflowTaskQueueRequest>,
  ): PollWorkflowTaskQueueRequest {
    const message = {
      ...basePollWorkflowTaskQueueRequest,
    } as PollWorkflowTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = object.binaryChecksum;
    } else {
      message.binaryChecksum = '';
    }
    return message;
  },
};

const basePollWorkflowTaskQueueResponse: object = {
  previousStartedEventId: 0,
  startedEventId: 0,
  attempt: 0,
  backlogCountHint: 0,
};

export const PollWorkflowTaskQueueResponse = {
  encode(
    message: PollWorkflowTaskQueueResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.previousStartedEventId !== 0) {
      writer.uint32(32).int64(message.previousStartedEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(40).int64(message.startedEventId);
    }
    if (message.attempt !== 0) {
      writer.uint32(48).int32(message.attempt);
    }
    if (message.backlogCountHint !== 0) {
      writer.uint32(56).int64(message.backlogCountHint);
    }
    if (message.history !== undefined) {
      History.encode(message.history, writer.uint32(66).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(74).bytes(message.nextPageToken);
    }
    if (message.query !== undefined) {
      WorkflowQuery.encode(message.query, writer.uint32(82).fork()).ldelim();
    }
    if (message.workflowExecutionTaskQueue !== undefined) {
      TaskQueue.encode(
        message.workflowExecutionTaskQueue,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.scheduledTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.scheduledTime),
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.startedTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startedTime),
        writer.uint32(106).fork(),
      ).ldelim();
    }
    Object.entries(message.queries).forEach(([key, value]) => {
      PollWorkflowTaskQueueResponse_QueriesEntry.encode(
        { key: key as any, value },
        writer.uint32(114).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PollWorkflowTaskQueueResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePollWorkflowTaskQueueResponse,
    } as PollWorkflowTaskQueueResponse;
    message.queries = {};
    message.taskToken = new Uint8Array();
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.previousStartedEventId = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.attempt = reader.int32();
          break;
        case 7:
          message.backlogCountHint = longToNumber(reader.int64() as Long);
          break;
        case 8:
          message.history = History.decode(reader, reader.uint32());
          break;
        case 9:
          message.nextPageToken = reader.bytes();
          break;
        case 10:
          message.query = WorkflowQuery.decode(reader, reader.uint32());
          break;
        case 11:
          message.workflowExecutionTaskQueue = TaskQueue.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 12:
          message.scheduledTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 13:
          message.startedTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 14:
          const entry14 = PollWorkflowTaskQueueResponse_QueriesEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry14.value !== undefined) {
            message.queries[entry14.key] = entry14.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PollWorkflowTaskQueueResponse {
    const message = {
      ...basePollWorkflowTaskQueueResponse,
    } as PollWorkflowTaskQueueResponse;
    message.queries = {};
    message.taskToken = new Uint8Array();
    message.nextPageToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.previousStartedEventId !== undefined &&
      object.previousStartedEventId !== null
    ) {
      message.previousStartedEventId = Number(object.previousStartedEventId);
    } else {
      message.previousStartedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = Number(object.attempt);
    } else {
      message.attempt = 0;
    }
    if (
      object.backlogCountHint !== undefined &&
      object.backlogCountHint !== null
    ) {
      message.backlogCountHint = Number(object.backlogCountHint);
    } else {
      message.backlogCountHint = 0;
    }
    if (object.history !== undefined && object.history !== null) {
      message.history = History.fromJSON(object.history);
    } else {
      message.history = undefined;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = WorkflowQuery.fromJSON(object.query);
    } else {
      message.query = undefined;
    }
    if (
      object.workflowExecutionTaskQueue !== undefined &&
      object.workflowExecutionTaskQueue !== null
    ) {
      message.workflowExecutionTaskQueue = TaskQueue.fromJSON(
        object.workflowExecutionTaskQueue,
      );
    } else {
      message.workflowExecutionTaskQueue = undefined;
    }
    if (object.scheduledTime !== undefined && object.scheduledTime !== null) {
      message.scheduledTime = fromJsonTimestamp(object.scheduledTime);
    } else {
      message.scheduledTime = undefined;
    }
    if (object.startedTime !== undefined && object.startedTime !== null) {
      message.startedTime = fromJsonTimestamp(object.startedTime);
    } else {
      message.startedTime = undefined;
    }
    if (object.queries !== undefined && object.queries !== null) {
      Object.entries(object.queries).forEach(([key, value]) => {
        message.queries[key] = WorkflowQuery.fromJSON(value);
      });
    }
    return message;
  },

  toJSON(message: PollWorkflowTaskQueueResponse): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.previousStartedEventId !== undefined &&
      (obj.previousStartedEventId = message.previousStartedEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.attempt !== undefined && (obj.attempt = message.attempt);
    message.backlogCountHint !== undefined &&
      (obj.backlogCountHint = message.backlogCountHint);
    message.history !== undefined &&
      (obj.history = message.history
        ? History.toJSON(message.history)
        : undefined);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.query !== undefined &&
      (obj.query = message.query
        ? WorkflowQuery.toJSON(message.query)
        : undefined);
    message.workflowExecutionTaskQueue !== undefined &&
      (obj.workflowExecutionTaskQueue = message.workflowExecutionTaskQueue
        ? TaskQueue.toJSON(message.workflowExecutionTaskQueue)
        : undefined);
    message.scheduledTime !== undefined &&
      (obj.scheduledTime = message.scheduledTime.toISOString());
    message.startedTime !== undefined &&
      (obj.startedTime = message.startedTime.toISOString());
    obj.queries = {};
    if (message.queries) {
      Object.entries(message.queries).forEach(([k, v]) => {
        obj.queries[k] = WorkflowQuery.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<PollWorkflowTaskQueueResponse>,
  ): PollWorkflowTaskQueueResponse {
    const message = {
      ...basePollWorkflowTaskQueueResponse,
    } as PollWorkflowTaskQueueResponse;
    message.queries = {};
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.previousStartedEventId !== undefined &&
      object.previousStartedEventId !== null
    ) {
      message.previousStartedEventId = object.previousStartedEventId;
    } else {
      message.previousStartedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = object.attempt;
    } else {
      message.attempt = 0;
    }
    if (
      object.backlogCountHint !== undefined &&
      object.backlogCountHint !== null
    ) {
      message.backlogCountHint = object.backlogCountHint;
    } else {
      message.backlogCountHint = 0;
    }
    if (object.history !== undefined && object.history !== null) {
      message.history = History.fromPartial(object.history);
    } else {
      message.history = undefined;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = WorkflowQuery.fromPartial(object.query);
    } else {
      message.query = undefined;
    }
    if (
      object.workflowExecutionTaskQueue !== undefined &&
      object.workflowExecutionTaskQueue !== null
    ) {
      message.workflowExecutionTaskQueue = TaskQueue.fromPartial(
        object.workflowExecutionTaskQueue,
      );
    } else {
      message.workflowExecutionTaskQueue = undefined;
    }
    if (object.scheduledTime !== undefined && object.scheduledTime !== null) {
      message.scheduledTime = object.scheduledTime;
    } else {
      message.scheduledTime = undefined;
    }
    if (object.startedTime !== undefined && object.startedTime !== null) {
      message.startedTime = object.startedTime;
    } else {
      message.startedTime = undefined;
    }
    if (object.queries !== undefined && object.queries !== null) {
      Object.entries(object.queries).forEach(([key, value]) => {
        if (value !== undefined) {
          message.queries[key] = WorkflowQuery.fromPartial(value);
        }
      });
    }
    return message;
  },
};

const basePollWorkflowTaskQueueResponse_QueriesEntry: object = { key: '' };

export const PollWorkflowTaskQueueResponse_QueriesEntry = {
  encode(
    message: PollWorkflowTaskQueueResponse_QueriesEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      WorkflowQuery.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PollWorkflowTaskQueueResponse_QueriesEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePollWorkflowTaskQueueResponse_QueriesEntry,
    } as PollWorkflowTaskQueueResponse_QueriesEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = WorkflowQuery.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PollWorkflowTaskQueueResponse_QueriesEntry {
    const message = {
      ...basePollWorkflowTaskQueueResponse_QueriesEntry,
    } as PollWorkflowTaskQueueResponse_QueriesEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = WorkflowQuery.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(message: PollWorkflowTaskQueueResponse_QueriesEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value
        ? WorkflowQuery.toJSON(message.value)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<PollWorkflowTaskQueueResponse_QueriesEntry>,
  ): PollWorkflowTaskQueueResponse_QueriesEntry {
    const message = {
      ...basePollWorkflowTaskQueueResponse_QueriesEntry,
    } as PollWorkflowTaskQueueResponse_QueriesEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = WorkflowQuery.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseRespondWorkflowTaskCompletedRequest: object = {
  identity: '',
  returnNewWorkflowTask: false,
  forceCreateNewWorkflowTask: false,
  binaryChecksum: '',
  namespace: '',
};

export const RespondWorkflowTaskCompletedRequest = {
  encode(
    message: RespondWorkflowTaskCompletedRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    for (const v of message.commands) {
      Command.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.stickyAttributes !== undefined) {
      StickyExecutionAttributes.encode(
        message.stickyAttributes,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.returnNewWorkflowTask === true) {
      writer.uint32(40).bool(message.returnNewWorkflowTask);
    }
    if (message.forceCreateNewWorkflowTask === true) {
      writer.uint32(48).bool(message.forceCreateNewWorkflowTask);
    }
    if (message.binaryChecksum !== '') {
      writer.uint32(58).string(message.binaryChecksum);
    }
    Object.entries(message.queryResults).forEach(([key, value]) => {
      RespondWorkflowTaskCompletedRequest_QueryResultsEntry.encode(
        { key: key as any, value },
        writer.uint32(66).fork(),
      ).ldelim();
    });
    if (message.namespace !== '') {
      writer.uint32(74).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondWorkflowTaskCompletedRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondWorkflowTaskCompletedRequest,
    } as RespondWorkflowTaskCompletedRequest;
    message.commands = [];
    message.queryResults = {};
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.commands.push(Command.decode(reader, reader.uint32()));
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.stickyAttributes = StickyExecutionAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.returnNewWorkflowTask = reader.bool();
          break;
        case 6:
          message.forceCreateNewWorkflowTask = reader.bool();
          break;
        case 7:
          message.binaryChecksum = reader.string();
          break;
        case 8:
          const entry8 =
            RespondWorkflowTaskCompletedRequest_QueryResultsEntry.decode(
              reader,
              reader.uint32(),
            );
          if (entry8.value !== undefined) {
            message.queryResults[entry8.key] = entry8.value;
          }
          break;
        case 9:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondWorkflowTaskCompletedRequest {
    const message = {
      ...baseRespondWorkflowTaskCompletedRequest,
    } as RespondWorkflowTaskCompletedRequest;
    message.commands = [];
    message.queryResults = {};
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.commands !== undefined && object.commands !== null) {
      for (const e of object.commands) {
        message.commands.push(Command.fromJSON(e));
      }
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (
      object.stickyAttributes !== undefined &&
      object.stickyAttributes !== null
    ) {
      message.stickyAttributes = StickyExecutionAttributes.fromJSON(
        object.stickyAttributes,
      );
    } else {
      message.stickyAttributes = undefined;
    }
    if (
      object.returnNewWorkflowTask !== undefined &&
      object.returnNewWorkflowTask !== null
    ) {
      message.returnNewWorkflowTask = Boolean(object.returnNewWorkflowTask);
    } else {
      message.returnNewWorkflowTask = false;
    }
    if (
      object.forceCreateNewWorkflowTask !== undefined &&
      object.forceCreateNewWorkflowTask !== null
    ) {
      message.forceCreateNewWorkflowTask = Boolean(
        object.forceCreateNewWorkflowTask,
      );
    } else {
      message.forceCreateNewWorkflowTask = false;
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = String(object.binaryChecksum);
    } else {
      message.binaryChecksum = '';
    }
    if (object.queryResults !== undefined && object.queryResults !== null) {
      Object.entries(object.queryResults).forEach(([key, value]) => {
        message.queryResults[key] = WorkflowQueryResult.fromJSON(value);
      });
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RespondWorkflowTaskCompletedRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    if (message.commands) {
      obj.commands = message.commands.map((e) =>
        e ? Command.toJSON(e) : undefined,
      );
    } else {
      obj.commands = [];
    }
    message.identity !== undefined && (obj.identity = message.identity);
    message.stickyAttributes !== undefined &&
      (obj.stickyAttributes = message.stickyAttributes
        ? StickyExecutionAttributes.toJSON(message.stickyAttributes)
        : undefined);
    message.returnNewWorkflowTask !== undefined &&
      (obj.returnNewWorkflowTask = message.returnNewWorkflowTask);
    message.forceCreateNewWorkflowTask !== undefined &&
      (obj.forceCreateNewWorkflowTask = message.forceCreateNewWorkflowTask);
    message.binaryChecksum !== undefined &&
      (obj.binaryChecksum = message.binaryChecksum);
    obj.queryResults = {};
    if (message.queryResults) {
      Object.entries(message.queryResults).forEach(([k, v]) => {
        obj.queryResults[k] = WorkflowQueryResult.toJSON(v);
      });
    }
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondWorkflowTaskCompletedRequest>,
  ): RespondWorkflowTaskCompletedRequest {
    const message = {
      ...baseRespondWorkflowTaskCompletedRequest,
    } as RespondWorkflowTaskCompletedRequest;
    message.commands = [];
    message.queryResults = {};
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.commands !== undefined && object.commands !== null) {
      for (const e of object.commands) {
        message.commands.push(Command.fromPartial(e));
      }
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (
      object.stickyAttributes !== undefined &&
      object.stickyAttributes !== null
    ) {
      message.stickyAttributes = StickyExecutionAttributes.fromPartial(
        object.stickyAttributes,
      );
    } else {
      message.stickyAttributes = undefined;
    }
    if (
      object.returnNewWorkflowTask !== undefined &&
      object.returnNewWorkflowTask !== null
    ) {
      message.returnNewWorkflowTask = object.returnNewWorkflowTask;
    } else {
      message.returnNewWorkflowTask = false;
    }
    if (
      object.forceCreateNewWorkflowTask !== undefined &&
      object.forceCreateNewWorkflowTask !== null
    ) {
      message.forceCreateNewWorkflowTask = object.forceCreateNewWorkflowTask;
    } else {
      message.forceCreateNewWorkflowTask = false;
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = object.binaryChecksum;
    } else {
      message.binaryChecksum = '';
    }
    if (object.queryResults !== undefined && object.queryResults !== null) {
      Object.entries(object.queryResults).forEach(([key, value]) => {
        if (value !== undefined) {
          message.queryResults[key] = WorkflowQueryResult.fromPartial(value);
        }
      });
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRespondWorkflowTaskCompletedRequest_QueryResultsEntry: object = {
  key: '',
};

export const RespondWorkflowTaskCompletedRequest_QueryResultsEntry = {
  encode(
    message: RespondWorkflowTaskCompletedRequest_QueryResultsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      WorkflowQueryResult.encode(
        message.value,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondWorkflowTaskCompletedRequest_QueryResultsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondWorkflowTaskCompletedRequest_QueryResultsEntry,
    } as RespondWorkflowTaskCompletedRequest_QueryResultsEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = WorkflowQueryResult.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondWorkflowTaskCompletedRequest_QueryResultsEntry {
    const message = {
      ...baseRespondWorkflowTaskCompletedRequest_QueryResultsEntry,
    } as RespondWorkflowTaskCompletedRequest_QueryResultsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = WorkflowQueryResult.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(
    message: RespondWorkflowTaskCompletedRequest_QueryResultsEntry,
  ): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value
        ? WorkflowQueryResult.toJSON(message.value)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondWorkflowTaskCompletedRequest_QueryResultsEntry>,
  ): RespondWorkflowTaskCompletedRequest_QueryResultsEntry {
    const message = {
      ...baseRespondWorkflowTaskCompletedRequest_QueryResultsEntry,
    } as RespondWorkflowTaskCompletedRequest_QueryResultsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = WorkflowQueryResult.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseRespondWorkflowTaskCompletedResponse: object = {};

export const RespondWorkflowTaskCompletedResponse = {
  encode(
    message: RespondWorkflowTaskCompletedResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowTask !== undefined) {
      PollWorkflowTaskQueueResponse.encode(
        message.workflowTask,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondWorkflowTaskCompletedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondWorkflowTaskCompletedResponse,
    } as RespondWorkflowTaskCompletedResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowTask = PollWorkflowTaskQueueResponse.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondWorkflowTaskCompletedResponse {
    const message = {
      ...baseRespondWorkflowTaskCompletedResponse,
    } as RespondWorkflowTaskCompletedResponse;
    if (object.workflowTask !== undefined && object.workflowTask !== null) {
      message.workflowTask = PollWorkflowTaskQueueResponse.fromJSON(
        object.workflowTask,
      );
    } else {
      message.workflowTask = undefined;
    }
    return message;
  },

  toJSON(message: RespondWorkflowTaskCompletedResponse): unknown {
    const obj: any = {};
    message.workflowTask !== undefined &&
      (obj.workflowTask = message.workflowTask
        ? PollWorkflowTaskQueueResponse.toJSON(message.workflowTask)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondWorkflowTaskCompletedResponse>,
  ): RespondWorkflowTaskCompletedResponse {
    const message = {
      ...baseRespondWorkflowTaskCompletedResponse,
    } as RespondWorkflowTaskCompletedResponse;
    if (object.workflowTask !== undefined && object.workflowTask !== null) {
      message.workflowTask = PollWorkflowTaskQueueResponse.fromPartial(
        object.workflowTask,
      );
    } else {
      message.workflowTask = undefined;
    }
    return message;
  },
};

const baseRespondWorkflowTaskFailedRequest: object = {
  cause: 0,
  identity: '',
  binaryChecksum: '',
  namespace: '',
};

export const RespondWorkflowTaskFailedRequest = {
  encode(
    message: RespondWorkflowTaskFailedRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.cause !== 0) {
      writer.uint32(16).int32(message.cause);
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(26).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(34).string(message.identity);
    }
    if (message.binaryChecksum !== '') {
      writer.uint32(42).string(message.binaryChecksum);
    }
    if (message.namespace !== '') {
      writer.uint32(50).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondWorkflowTaskFailedRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondWorkflowTaskFailedRequest,
    } as RespondWorkflowTaskFailedRequest;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.cause = reader.int32() as any;
          break;
        case 3:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 4:
          message.identity = reader.string();
          break;
        case 5:
          message.binaryChecksum = reader.string();
          break;
        case 6:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondWorkflowTaskFailedRequest {
    const message = {
      ...baseRespondWorkflowTaskFailedRequest,
    } as RespondWorkflowTaskFailedRequest;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = workflowTaskFailedCauseFromJSON(object.cause);
    } else {
      message.cause = 0;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = String(object.binaryChecksum);
    } else {
      message.binaryChecksum = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RespondWorkflowTaskFailedRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.cause !== undefined &&
      (obj.cause = workflowTaskFailedCauseToJSON(message.cause));
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.binaryChecksum !== undefined &&
      (obj.binaryChecksum = message.binaryChecksum);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondWorkflowTaskFailedRequest>,
  ): RespondWorkflowTaskFailedRequest {
    const message = {
      ...baseRespondWorkflowTaskFailedRequest,
    } as RespondWorkflowTaskFailedRequest;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = object.cause;
    } else {
      message.cause = 0;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = object.binaryChecksum;
    } else {
      message.binaryChecksum = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRespondWorkflowTaskFailedResponse: object = {};

export const RespondWorkflowTaskFailedResponse = {
  encode(
    _: RespondWorkflowTaskFailedResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondWorkflowTaskFailedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondWorkflowTaskFailedResponse,
    } as RespondWorkflowTaskFailedResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondWorkflowTaskFailedResponse {
    const message = {
      ...baseRespondWorkflowTaskFailedResponse,
    } as RespondWorkflowTaskFailedResponse;
    return message;
  },

  toJSON(_: RespondWorkflowTaskFailedResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondWorkflowTaskFailedResponse>,
  ): RespondWorkflowTaskFailedResponse {
    const message = {
      ...baseRespondWorkflowTaskFailedResponse,
    } as RespondWorkflowTaskFailedResponse;
    return message;
  },
};

const basePollActivityTaskQueueRequest: object = {
  namespace: '',
  identity: '',
};

export const PollActivityTaskQueueRequest = {
  encode(
    message: PollActivityTaskQueueRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.taskQueueMetadata !== undefined) {
      TaskQueueMetadata.encode(
        message.taskQueueMetadata,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PollActivityTaskQueueRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePollActivityTaskQueueRequest,
    } as PollActivityTaskQueueRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.taskQueueMetadata = TaskQueueMetadata.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PollActivityTaskQueueRequest {
    const message = {
      ...basePollActivityTaskQueueRequest,
    } as PollActivityTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (
      object.taskQueueMetadata !== undefined &&
      object.taskQueueMetadata !== null
    ) {
      message.taskQueueMetadata = TaskQueueMetadata.fromJSON(
        object.taskQueueMetadata,
      );
    } else {
      message.taskQueueMetadata = undefined;
    }
    return message;
  },

  toJSON(message: PollActivityTaskQueueRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.taskQueueMetadata !== undefined &&
      (obj.taskQueueMetadata = message.taskQueueMetadata
        ? TaskQueueMetadata.toJSON(message.taskQueueMetadata)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<PollActivityTaskQueueRequest>,
  ): PollActivityTaskQueueRequest {
    const message = {
      ...basePollActivityTaskQueueRequest,
    } as PollActivityTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (
      object.taskQueueMetadata !== undefined &&
      object.taskQueueMetadata !== null
    ) {
      message.taskQueueMetadata = TaskQueueMetadata.fromPartial(
        object.taskQueueMetadata,
      );
    } else {
      message.taskQueueMetadata = undefined;
    }
    return message;
  },
};

const basePollActivityTaskQueueResponse: object = {
  workflowNamespace: '',
  activityId: '',
  attempt: 0,
};

export const PollActivityTaskQueueResponse = {
  encode(
    message: PollActivityTaskQueueResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.workflowNamespace !== '') {
      writer.uint32(18).string(message.workflowNamespace);
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.activityType !== undefined) {
      ActivityType.encode(
        message.activityType,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.activityId !== '') {
      writer.uint32(50).string(message.activityId);
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(58).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(66).fork()).ldelim();
    }
    if (message.heartbeatDetails !== undefined) {
      Payloads.encode(
        message.heartbeatDetails,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.scheduledTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.scheduledTime),
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.currentAttemptScheduledTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.currentAttemptScheduledTime),
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.startedTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startedTime),
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.attempt !== 0) {
      writer.uint32(104).int32(message.attempt);
    }
    if (message.scheduleToCloseTimeout !== undefined) {
      Duration.encode(
        message.scheduleToCloseTimeout,
        writer.uint32(114).fork(),
      ).ldelim();
    }
    if (message.startToCloseTimeout !== undefined) {
      Duration.encode(
        message.startToCloseTimeout,
        writer.uint32(122).fork(),
      ).ldelim();
    }
    if (message.heartbeatTimeout !== undefined) {
      Duration.encode(
        message.heartbeatTimeout,
        writer.uint32(130).fork(),
      ).ldelim();
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(138).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PollActivityTaskQueueResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePollActivityTaskQueueResponse,
    } as PollActivityTaskQueueResponse;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.workflowNamespace = reader.string();
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.activityType = ActivityType.decode(reader, reader.uint32());
          break;
        case 6:
          message.activityId = reader.string();
          break;
        case 7:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 8:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 9:
          message.heartbeatDetails = Payloads.decode(reader, reader.uint32());
          break;
        case 10:
          message.scheduledTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 11:
          message.currentAttemptScheduledTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 12:
          message.startedTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 13:
          message.attempt = reader.int32();
          break;
        case 14:
          message.scheduleToCloseTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 15:
          message.startToCloseTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 16:
          message.heartbeatTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 17:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PollActivityTaskQueueResponse {
    const message = {
      ...basePollActivityTaskQueueResponse,
    } as PollActivityTaskQueueResponse;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (
      object.workflowNamespace !== undefined &&
      object.workflowNamespace !== null
    ) {
      message.workflowNamespace = String(object.workflowNamespace);
    } else {
      message.workflowNamespace = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.activityType !== undefined && object.activityType !== null) {
      message.activityType = ActivityType.fromJSON(object.activityType);
    } else {
      message.activityType = undefined;
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.heartbeatDetails !== undefined &&
      object.heartbeatDetails !== null
    ) {
      message.heartbeatDetails = Payloads.fromJSON(object.heartbeatDetails);
    } else {
      message.heartbeatDetails = undefined;
    }
    if (object.scheduledTime !== undefined && object.scheduledTime !== null) {
      message.scheduledTime = fromJsonTimestamp(object.scheduledTime);
    } else {
      message.scheduledTime = undefined;
    }
    if (
      object.currentAttemptScheduledTime !== undefined &&
      object.currentAttemptScheduledTime !== null
    ) {
      message.currentAttemptScheduledTime = fromJsonTimestamp(
        object.currentAttemptScheduledTime,
      );
    } else {
      message.currentAttemptScheduledTime = undefined;
    }
    if (object.startedTime !== undefined && object.startedTime !== null) {
      message.startedTime = fromJsonTimestamp(object.startedTime);
    } else {
      message.startedTime = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = Number(object.attempt);
    } else {
      message.attempt = 0;
    }
    if (
      object.scheduleToCloseTimeout !== undefined &&
      object.scheduleToCloseTimeout !== null
    ) {
      message.scheduleToCloseTimeout = Duration.fromJSON(
        object.scheduleToCloseTimeout,
      );
    } else {
      message.scheduleToCloseTimeout = undefined;
    }
    if (
      object.startToCloseTimeout !== undefined &&
      object.startToCloseTimeout !== null
    ) {
      message.startToCloseTimeout = Duration.fromJSON(
        object.startToCloseTimeout,
      );
    } else {
      message.startToCloseTimeout = undefined;
    }
    if (
      object.heartbeatTimeout !== undefined &&
      object.heartbeatTimeout !== null
    ) {
      message.heartbeatTimeout = Duration.fromJSON(object.heartbeatTimeout);
    } else {
      message.heartbeatTimeout = undefined;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    return message;
  },

  toJSON(message: PollActivityTaskQueueResponse): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.workflowNamespace !== undefined &&
      (obj.workflowNamespace = message.workflowNamespace);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.activityType !== undefined &&
      (obj.activityType = message.activityType
        ? ActivityType.toJSON(message.activityType)
        : undefined);
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.heartbeatDetails !== undefined &&
      (obj.heartbeatDetails = message.heartbeatDetails
        ? Payloads.toJSON(message.heartbeatDetails)
        : undefined);
    message.scheduledTime !== undefined &&
      (obj.scheduledTime = message.scheduledTime.toISOString());
    message.currentAttemptScheduledTime !== undefined &&
      (obj.currentAttemptScheduledTime =
        message.currentAttemptScheduledTime.toISOString());
    message.startedTime !== undefined &&
      (obj.startedTime = message.startedTime.toISOString());
    message.attempt !== undefined && (obj.attempt = message.attempt);
    message.scheduleToCloseTimeout !== undefined &&
      (obj.scheduleToCloseTimeout = message.scheduleToCloseTimeout
        ? Duration.toJSON(message.scheduleToCloseTimeout)
        : undefined);
    message.startToCloseTimeout !== undefined &&
      (obj.startToCloseTimeout = message.startToCloseTimeout
        ? Duration.toJSON(message.startToCloseTimeout)
        : undefined);
    message.heartbeatTimeout !== undefined &&
      (obj.heartbeatTimeout = message.heartbeatTimeout
        ? Duration.toJSON(message.heartbeatTimeout)
        : undefined);
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<PollActivityTaskQueueResponse>,
  ): PollActivityTaskQueueResponse {
    const message = {
      ...basePollActivityTaskQueueResponse,
    } as PollActivityTaskQueueResponse;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (
      object.workflowNamespace !== undefined &&
      object.workflowNamespace !== null
    ) {
      message.workflowNamespace = object.workflowNamespace;
    } else {
      message.workflowNamespace = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.activityType !== undefined && object.activityType !== null) {
      message.activityType = ActivityType.fromPartial(object.activityType);
    } else {
      message.activityType = undefined;
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.heartbeatDetails !== undefined &&
      object.heartbeatDetails !== null
    ) {
      message.heartbeatDetails = Payloads.fromPartial(object.heartbeatDetails);
    } else {
      message.heartbeatDetails = undefined;
    }
    if (object.scheduledTime !== undefined && object.scheduledTime !== null) {
      message.scheduledTime = object.scheduledTime;
    } else {
      message.scheduledTime = undefined;
    }
    if (
      object.currentAttemptScheduledTime !== undefined &&
      object.currentAttemptScheduledTime !== null
    ) {
      message.currentAttemptScheduledTime = object.currentAttemptScheduledTime;
    } else {
      message.currentAttemptScheduledTime = undefined;
    }
    if (object.startedTime !== undefined && object.startedTime !== null) {
      message.startedTime = object.startedTime;
    } else {
      message.startedTime = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = object.attempt;
    } else {
      message.attempt = 0;
    }
    if (
      object.scheduleToCloseTimeout !== undefined &&
      object.scheduleToCloseTimeout !== null
    ) {
      message.scheduleToCloseTimeout = Duration.fromPartial(
        object.scheduleToCloseTimeout,
      );
    } else {
      message.scheduleToCloseTimeout = undefined;
    }
    if (
      object.startToCloseTimeout !== undefined &&
      object.startToCloseTimeout !== null
    ) {
      message.startToCloseTimeout = Duration.fromPartial(
        object.startToCloseTimeout,
      );
    } else {
      message.startToCloseTimeout = undefined;
    }
    if (
      object.heartbeatTimeout !== undefined &&
      object.heartbeatTimeout !== null
    ) {
      message.heartbeatTimeout = Duration.fromPartial(object.heartbeatTimeout);
    } else {
      message.heartbeatTimeout = undefined;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    return message;
  },
};

const baseRecordActivityTaskHeartbeatRequest: object = {
  identity: '',
  namespace: '',
};

export const RecordActivityTaskHeartbeatRequest = {
  encode(
    message: RecordActivityTaskHeartbeatRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.namespace !== '') {
      writer.uint32(34).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RecordActivityTaskHeartbeatRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRecordActivityTaskHeartbeatRequest,
    } as RecordActivityTaskHeartbeatRequest;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordActivityTaskHeartbeatRequest {
    const message = {
      ...baseRecordActivityTaskHeartbeatRequest,
    } as RecordActivityTaskHeartbeatRequest;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RecordActivityTaskHeartbeatRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordActivityTaskHeartbeatRequest>,
  ): RecordActivityTaskHeartbeatRequest {
    const message = {
      ...baseRecordActivityTaskHeartbeatRequest,
    } as RecordActivityTaskHeartbeatRequest;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRecordActivityTaskHeartbeatResponse: object = {
  cancelRequested: false,
};

export const RecordActivityTaskHeartbeatResponse = {
  encode(
    message: RecordActivityTaskHeartbeatResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cancelRequested === true) {
      writer.uint32(8).bool(message.cancelRequested);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RecordActivityTaskHeartbeatResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRecordActivityTaskHeartbeatResponse,
    } as RecordActivityTaskHeartbeatResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cancelRequested = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordActivityTaskHeartbeatResponse {
    const message = {
      ...baseRecordActivityTaskHeartbeatResponse,
    } as RecordActivityTaskHeartbeatResponse;
    if (
      object.cancelRequested !== undefined &&
      object.cancelRequested !== null
    ) {
      message.cancelRequested = Boolean(object.cancelRequested);
    } else {
      message.cancelRequested = false;
    }
    return message;
  },

  toJSON(message: RecordActivityTaskHeartbeatResponse): unknown {
    const obj: any = {};
    message.cancelRequested !== undefined &&
      (obj.cancelRequested = message.cancelRequested);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordActivityTaskHeartbeatResponse>,
  ): RecordActivityTaskHeartbeatResponse {
    const message = {
      ...baseRecordActivityTaskHeartbeatResponse,
    } as RecordActivityTaskHeartbeatResponse;
    if (
      object.cancelRequested !== undefined &&
      object.cancelRequested !== null
    ) {
      message.cancelRequested = object.cancelRequested;
    } else {
      message.cancelRequested = false;
    }
    return message;
  },
};

const baseRecordActivityTaskHeartbeatByIdRequest: object = {
  namespace: '',
  workflowId: '',
  runId: '',
  activityId: '',
  identity: '',
};

export const RecordActivityTaskHeartbeatByIdRequest = {
  encode(
    message: RecordActivityTaskHeartbeatByIdRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(26).string(message.runId);
    }
    if (message.activityId !== '') {
      writer.uint32(34).string(message.activityId);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(42).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(50).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RecordActivityTaskHeartbeatByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRecordActivityTaskHeartbeatByIdRequest,
    } as RecordActivityTaskHeartbeatByIdRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.runId = reader.string();
          break;
        case 4:
          message.activityId = reader.string();
          break;
        case 5:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordActivityTaskHeartbeatByIdRequest {
    const message = {
      ...baseRecordActivityTaskHeartbeatByIdRequest,
    } as RecordActivityTaskHeartbeatByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: RecordActivityTaskHeartbeatByIdRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordActivityTaskHeartbeatByIdRequest>,
  ): RecordActivityTaskHeartbeatByIdRequest {
    const message = {
      ...baseRecordActivityTaskHeartbeatByIdRequest,
    } as RecordActivityTaskHeartbeatByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseRecordActivityTaskHeartbeatByIdResponse: object = {
  cancelRequested: false,
};

export const RecordActivityTaskHeartbeatByIdResponse = {
  encode(
    message: RecordActivityTaskHeartbeatByIdResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cancelRequested === true) {
      writer.uint32(8).bool(message.cancelRequested);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RecordActivityTaskHeartbeatByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRecordActivityTaskHeartbeatByIdResponse,
    } as RecordActivityTaskHeartbeatByIdResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cancelRequested = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordActivityTaskHeartbeatByIdResponse {
    const message = {
      ...baseRecordActivityTaskHeartbeatByIdResponse,
    } as RecordActivityTaskHeartbeatByIdResponse;
    if (
      object.cancelRequested !== undefined &&
      object.cancelRequested !== null
    ) {
      message.cancelRequested = Boolean(object.cancelRequested);
    } else {
      message.cancelRequested = false;
    }
    return message;
  },

  toJSON(message: RecordActivityTaskHeartbeatByIdResponse): unknown {
    const obj: any = {};
    message.cancelRequested !== undefined &&
      (obj.cancelRequested = message.cancelRequested);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordActivityTaskHeartbeatByIdResponse>,
  ): RecordActivityTaskHeartbeatByIdResponse {
    const message = {
      ...baseRecordActivityTaskHeartbeatByIdResponse,
    } as RecordActivityTaskHeartbeatByIdResponse;
    if (
      object.cancelRequested !== undefined &&
      object.cancelRequested !== null
    ) {
      message.cancelRequested = object.cancelRequested;
    } else {
      message.cancelRequested = false;
    }
    return message;
  },
};

const baseRespondActivityTaskCompletedRequest: object = {
  identity: '',
  namespace: '',
};

export const RespondActivityTaskCompletedRequest = {
  encode(
    message: RespondActivityTaskCompletedRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.result !== undefined) {
      Payloads.encode(message.result, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.namespace !== '') {
      writer.uint32(34).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCompletedRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCompletedRequest,
    } as RespondActivityTaskCompletedRequest;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.result = Payloads.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondActivityTaskCompletedRequest {
    const message = {
      ...baseRespondActivityTaskCompletedRequest,
    } as RespondActivityTaskCompletedRequest;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromJSON(object.result);
    } else {
      message.result = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RespondActivityTaskCompletedRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.result !== undefined &&
      (obj.result = message.result
        ? Payloads.toJSON(message.result)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondActivityTaskCompletedRequest>,
  ): RespondActivityTaskCompletedRequest {
    const message = {
      ...baseRespondActivityTaskCompletedRequest,
    } as RespondActivityTaskCompletedRequest;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromPartial(object.result);
    } else {
      message.result = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRespondActivityTaskCompletedResponse: object = {};

export const RespondActivityTaskCompletedResponse = {
  encode(
    _: RespondActivityTaskCompletedResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCompletedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCompletedResponse,
    } as RespondActivityTaskCompletedResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondActivityTaskCompletedResponse {
    const message = {
      ...baseRespondActivityTaskCompletedResponse,
    } as RespondActivityTaskCompletedResponse;
    return message;
  },

  toJSON(_: RespondActivityTaskCompletedResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondActivityTaskCompletedResponse>,
  ): RespondActivityTaskCompletedResponse {
    const message = {
      ...baseRespondActivityTaskCompletedResponse,
    } as RespondActivityTaskCompletedResponse;
    return message;
  },
};

const baseRespondActivityTaskCompletedByIdRequest: object = {
  namespace: '',
  workflowId: '',
  runId: '',
  activityId: '',
  identity: '',
};

export const RespondActivityTaskCompletedByIdRequest = {
  encode(
    message: RespondActivityTaskCompletedByIdRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(26).string(message.runId);
    }
    if (message.activityId !== '') {
      writer.uint32(34).string(message.activityId);
    }
    if (message.result !== undefined) {
      Payloads.encode(message.result, writer.uint32(42).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(50).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCompletedByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCompletedByIdRequest,
    } as RespondActivityTaskCompletedByIdRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.runId = reader.string();
          break;
        case 4:
          message.activityId = reader.string();
          break;
        case 5:
          message.result = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondActivityTaskCompletedByIdRequest {
    const message = {
      ...baseRespondActivityTaskCompletedByIdRequest,
    } as RespondActivityTaskCompletedByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromJSON(object.result);
    } else {
      message.result = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: RespondActivityTaskCompletedByIdRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.result !== undefined &&
      (obj.result = message.result
        ? Payloads.toJSON(message.result)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondActivityTaskCompletedByIdRequest>,
  ): RespondActivityTaskCompletedByIdRequest {
    const message = {
      ...baseRespondActivityTaskCompletedByIdRequest,
    } as RespondActivityTaskCompletedByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromPartial(object.result);
    } else {
      message.result = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseRespondActivityTaskCompletedByIdResponse: object = {};

export const RespondActivityTaskCompletedByIdResponse = {
  encode(
    _: RespondActivityTaskCompletedByIdResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCompletedByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCompletedByIdResponse,
    } as RespondActivityTaskCompletedByIdResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondActivityTaskCompletedByIdResponse {
    const message = {
      ...baseRespondActivityTaskCompletedByIdResponse,
    } as RespondActivityTaskCompletedByIdResponse;
    return message;
  },

  toJSON(_: RespondActivityTaskCompletedByIdResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondActivityTaskCompletedByIdResponse>,
  ): RespondActivityTaskCompletedByIdResponse {
    const message = {
      ...baseRespondActivityTaskCompletedByIdResponse,
    } as RespondActivityTaskCompletedByIdResponse;
    return message;
  },
};

const baseRespondActivityTaskFailedRequest: object = {
  identity: '',
  namespace: '',
};

export const RespondActivityTaskFailedRequest = {
  encode(
    message: RespondActivityTaskFailedRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.namespace !== '') {
      writer.uint32(34).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskFailedRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskFailedRequest,
    } as RespondActivityTaskFailedRequest;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondActivityTaskFailedRequest {
    const message = {
      ...baseRespondActivityTaskFailedRequest,
    } as RespondActivityTaskFailedRequest;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RespondActivityTaskFailedRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondActivityTaskFailedRequest>,
  ): RespondActivityTaskFailedRequest {
    const message = {
      ...baseRespondActivityTaskFailedRequest,
    } as RespondActivityTaskFailedRequest;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRespondActivityTaskFailedResponse: object = {};

export const RespondActivityTaskFailedResponse = {
  encode(
    _: RespondActivityTaskFailedResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskFailedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskFailedResponse,
    } as RespondActivityTaskFailedResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondActivityTaskFailedResponse {
    const message = {
      ...baseRespondActivityTaskFailedResponse,
    } as RespondActivityTaskFailedResponse;
    return message;
  },

  toJSON(_: RespondActivityTaskFailedResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondActivityTaskFailedResponse>,
  ): RespondActivityTaskFailedResponse {
    const message = {
      ...baseRespondActivityTaskFailedResponse,
    } as RespondActivityTaskFailedResponse;
    return message;
  },
};

const baseRespondActivityTaskFailedByIdRequest: object = {
  namespace: '',
  workflowId: '',
  runId: '',
  activityId: '',
  identity: '',
};

export const RespondActivityTaskFailedByIdRequest = {
  encode(
    message: RespondActivityTaskFailedByIdRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(26).string(message.runId);
    }
    if (message.activityId !== '') {
      writer.uint32(34).string(message.activityId);
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(42).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(50).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskFailedByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskFailedByIdRequest,
    } as RespondActivityTaskFailedByIdRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.runId = reader.string();
          break;
        case 4:
          message.activityId = reader.string();
          break;
        case 5:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 6:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondActivityTaskFailedByIdRequest {
    const message = {
      ...baseRespondActivityTaskFailedByIdRequest,
    } as RespondActivityTaskFailedByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: RespondActivityTaskFailedByIdRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondActivityTaskFailedByIdRequest>,
  ): RespondActivityTaskFailedByIdRequest {
    const message = {
      ...baseRespondActivityTaskFailedByIdRequest,
    } as RespondActivityTaskFailedByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseRespondActivityTaskFailedByIdResponse: object = {};

export const RespondActivityTaskFailedByIdResponse = {
  encode(
    _: RespondActivityTaskFailedByIdResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskFailedByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskFailedByIdResponse,
    } as RespondActivityTaskFailedByIdResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondActivityTaskFailedByIdResponse {
    const message = {
      ...baseRespondActivityTaskFailedByIdResponse,
    } as RespondActivityTaskFailedByIdResponse;
    return message;
  },

  toJSON(_: RespondActivityTaskFailedByIdResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondActivityTaskFailedByIdResponse>,
  ): RespondActivityTaskFailedByIdResponse {
    const message = {
      ...baseRespondActivityTaskFailedByIdResponse,
    } as RespondActivityTaskFailedByIdResponse;
    return message;
  },
};

const baseRespondActivityTaskCanceledRequest: object = {
  identity: '',
  namespace: '',
};

export const RespondActivityTaskCanceledRequest = {
  encode(
    message: RespondActivityTaskCanceledRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.namespace !== '') {
      writer.uint32(34).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCanceledRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCanceledRequest,
    } as RespondActivityTaskCanceledRequest;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondActivityTaskCanceledRequest {
    const message = {
      ...baseRespondActivityTaskCanceledRequest,
    } as RespondActivityTaskCanceledRequest;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RespondActivityTaskCanceledRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondActivityTaskCanceledRequest>,
  ): RespondActivityTaskCanceledRequest {
    const message = {
      ...baseRespondActivityTaskCanceledRequest,
    } as RespondActivityTaskCanceledRequest;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRespondActivityTaskCanceledResponse: object = {};

export const RespondActivityTaskCanceledResponse = {
  encode(
    _: RespondActivityTaskCanceledResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCanceledResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCanceledResponse,
    } as RespondActivityTaskCanceledResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondActivityTaskCanceledResponse {
    const message = {
      ...baseRespondActivityTaskCanceledResponse,
    } as RespondActivityTaskCanceledResponse;
    return message;
  },

  toJSON(_: RespondActivityTaskCanceledResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondActivityTaskCanceledResponse>,
  ): RespondActivityTaskCanceledResponse {
    const message = {
      ...baseRespondActivityTaskCanceledResponse,
    } as RespondActivityTaskCanceledResponse;
    return message;
  },
};

const baseRespondActivityTaskCanceledByIdRequest: object = {
  namespace: '',
  workflowId: '',
  runId: '',
  activityId: '',
  identity: '',
};

export const RespondActivityTaskCanceledByIdRequest = {
  encode(
    message: RespondActivityTaskCanceledByIdRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(26).string(message.runId);
    }
    if (message.activityId !== '') {
      writer.uint32(34).string(message.activityId);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(42).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(50).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCanceledByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCanceledByIdRequest,
    } as RespondActivityTaskCanceledByIdRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.runId = reader.string();
          break;
        case 4:
          message.activityId = reader.string();
          break;
        case 5:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondActivityTaskCanceledByIdRequest {
    const message = {
      ...baseRespondActivityTaskCanceledByIdRequest,
    } as RespondActivityTaskCanceledByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: RespondActivityTaskCanceledByIdRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondActivityTaskCanceledByIdRequest>,
  ): RespondActivityTaskCanceledByIdRequest {
    const message = {
      ...baseRespondActivityTaskCanceledByIdRequest,
    } as RespondActivityTaskCanceledByIdRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseRespondActivityTaskCanceledByIdResponse: object = {};

export const RespondActivityTaskCanceledByIdResponse = {
  encode(
    _: RespondActivityTaskCanceledByIdResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondActivityTaskCanceledByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondActivityTaskCanceledByIdResponse,
    } as RespondActivityTaskCanceledByIdResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondActivityTaskCanceledByIdResponse {
    const message = {
      ...baseRespondActivityTaskCanceledByIdResponse,
    } as RespondActivityTaskCanceledByIdResponse;
    return message;
  },

  toJSON(_: RespondActivityTaskCanceledByIdResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondActivityTaskCanceledByIdResponse>,
  ): RespondActivityTaskCanceledByIdResponse {
    const message = {
      ...baseRespondActivityTaskCanceledByIdResponse,
    } as RespondActivityTaskCanceledByIdResponse;
    return message;
  },
};

const baseRequestCancelWorkflowExecutionRequest: object = {
  namespace: '',
  identity: '',
  requestId: '',
  firstExecutionRunId: '',
};

export const RequestCancelWorkflowExecutionRequest = {
  encode(
    message: RequestCancelWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.requestId !== '') {
      writer.uint32(34).string(message.requestId);
    }
    if (message.firstExecutionRunId !== '') {
      writer.uint32(42).string(message.firstExecutionRunId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RequestCancelWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRequestCancelWorkflowExecutionRequest,
    } as RequestCancelWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.requestId = reader.string();
          break;
        case 5:
          message.firstExecutionRunId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RequestCancelWorkflowExecutionRequest {
    const message = {
      ...baseRequestCancelWorkflowExecutionRequest,
    } as RequestCancelWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    if (
      object.firstExecutionRunId !== undefined &&
      object.firstExecutionRunId !== null
    ) {
      message.firstExecutionRunId = String(object.firstExecutionRunId);
    } else {
      message.firstExecutionRunId = '';
    }
    return message;
  },

  toJSON(message: RequestCancelWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.firstExecutionRunId !== undefined &&
      (obj.firstExecutionRunId = message.firstExecutionRunId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RequestCancelWorkflowExecutionRequest>,
  ): RequestCancelWorkflowExecutionRequest {
    const message = {
      ...baseRequestCancelWorkflowExecutionRequest,
    } as RequestCancelWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    if (
      object.firstExecutionRunId !== undefined &&
      object.firstExecutionRunId !== null
    ) {
      message.firstExecutionRunId = object.firstExecutionRunId;
    } else {
      message.firstExecutionRunId = '';
    }
    return message;
  },
};

const baseRequestCancelWorkflowExecutionResponse: object = {};

export const RequestCancelWorkflowExecutionResponse = {
  encode(
    _: RequestCancelWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RequestCancelWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRequestCancelWorkflowExecutionResponse,
    } as RequestCancelWorkflowExecutionResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RequestCancelWorkflowExecutionResponse {
    const message = {
      ...baseRequestCancelWorkflowExecutionResponse,
    } as RequestCancelWorkflowExecutionResponse;
    return message;
  },

  toJSON(_: RequestCancelWorkflowExecutionResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RequestCancelWorkflowExecutionResponse>,
  ): RequestCancelWorkflowExecutionResponse {
    const message = {
      ...baseRequestCancelWorkflowExecutionResponse,
    } as RequestCancelWorkflowExecutionResponse;
    return message;
  },
};

const baseSignalWorkflowExecutionRequest: object = {
  namespace: '',
  signalName: '',
  identity: '',
  requestId: '',
  control: '',
};

export const SignalWorkflowExecutionRequest = {
  encode(
    message: SignalWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.signalName !== '') {
      writer.uint32(26).string(message.signalName);
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(34).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(42).string(message.identity);
    }
    if (message.requestId !== '') {
      writer.uint32(50).string(message.requestId);
    }
    if (message.control !== '') {
      writer.uint32(58).string(message.control);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalWorkflowExecutionRequest,
    } as SignalWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.signalName = reader.string();
          break;
        case 4:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 5:
          message.identity = reader.string();
          break;
        case 6:
          message.requestId = reader.string();
          break;
        case 7:
          message.control = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignalWorkflowExecutionRequest {
    const message = {
      ...baseSignalWorkflowExecutionRequest,
    } as SignalWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = String(object.signalName);
    } else {
      message.signalName = '';
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    return message;
  },

  toJSON(message: SignalWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.signalName !== undefined && (obj.signalName = message.signalName);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.control !== undefined && (obj.control = message.control);
    return obj;
  },

  fromPartial(
    object: DeepPartial<SignalWorkflowExecutionRequest>,
  ): SignalWorkflowExecutionRequest {
    const message = {
      ...baseSignalWorkflowExecutionRequest,
    } as SignalWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = object.signalName;
    } else {
      message.signalName = '';
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    return message;
  },
};

const baseSignalWorkflowExecutionResponse: object = {};

export const SignalWorkflowExecutionResponse = {
  encode(
    _: SignalWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalWorkflowExecutionResponse,
    } as SignalWorkflowExecutionResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): SignalWorkflowExecutionResponse {
    const message = {
      ...baseSignalWorkflowExecutionResponse,
    } as SignalWorkflowExecutionResponse;
    return message;
  },

  toJSON(_: SignalWorkflowExecutionResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<SignalWorkflowExecutionResponse>,
  ): SignalWorkflowExecutionResponse {
    const message = {
      ...baseSignalWorkflowExecutionResponse,
    } as SignalWorkflowExecutionResponse;
    return message;
  },
};

const baseSignalWithStartWorkflowExecutionRequest: object = {
  namespace: '',
  workflowId: '',
  identity: '',
  requestId: '',
  workflowIdReusePolicy: 0,
  signalName: '',
  control: '',
  cronSchedule: '',
};

export const SignalWithStartWorkflowExecutionRequest = {
  encode(
    message: SignalWithStartWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(34).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(42).fork()).ldelim();
    }
    if (message.workflowExecutionTimeout !== undefined) {
      Duration.encode(
        message.workflowExecutionTimeout,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimeout !== undefined) {
      Duration.encode(
        message.workflowTaskTimeout,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(74).string(message.identity);
    }
    if (message.requestId !== '') {
      writer.uint32(82).string(message.requestId);
    }
    if (message.workflowIdReusePolicy !== 0) {
      writer.uint32(88).int32(message.workflowIdReusePolicy);
    }
    if (message.signalName !== '') {
      writer.uint32(98).string(message.signalName);
    }
    if (message.signalInput !== undefined) {
      Payloads.encode(message.signalInput, writer.uint32(106).fork()).ldelim();
    }
    if (message.control !== '') {
      writer.uint32(114).string(message.control);
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(122).fork(),
      ).ldelim();
    }
    if (message.cronSchedule !== '') {
      writer.uint32(130).string(message.cronSchedule);
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(138).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(146).fork(),
      ).ldelim();
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(154).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalWithStartWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalWithStartWorkflowExecutionRequest,
    } as SignalWithStartWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 5:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.workflowExecutionTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 8:
          message.workflowTaskTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.identity = reader.string();
          break;
        case 10:
          message.requestId = reader.string();
          break;
        case 11:
          message.workflowIdReusePolicy = reader.int32() as any;
          break;
        case 12:
          message.signalName = reader.string();
          break;
        case 13:
          message.signalInput = Payloads.decode(reader, reader.uint32());
          break;
        case 14:
          message.control = reader.string();
          break;
        case 15:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        case 16:
          message.cronSchedule = reader.string();
          break;
        case 17:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 18:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 19:
          message.header = Header.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignalWithStartWorkflowExecutionRequest {
    const message = {
      ...baseSignalWithStartWorkflowExecutionRequest,
    } as SignalWithStartWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromJSON(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromJSON(object.workflowRunTimeout);
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromJSON(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    if (
      object.workflowIdReusePolicy !== undefined &&
      object.workflowIdReusePolicy !== null
    ) {
      message.workflowIdReusePolicy = workflowIdReusePolicyFromJSON(
        object.workflowIdReusePolicy,
      );
    } else {
      message.workflowIdReusePolicy = 0;
    }
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = String(object.signalName);
    } else {
      message.signalName = '';
    }
    if (object.signalInput !== undefined && object.signalInput !== null) {
      message.signalInput = Payloads.fromJSON(object.signalInput);
    } else {
      message.signalInput = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = String(object.cronSchedule);
    } else {
      message.cronSchedule = '';
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromJSON(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromJSON(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },

  toJSON(message: SignalWithStartWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.workflowExecutionTimeout !== undefined &&
      (obj.workflowExecutionTimeout = message.workflowExecutionTimeout
        ? Duration.toJSON(message.workflowExecutionTimeout)
        : undefined);
    message.workflowRunTimeout !== undefined &&
      (obj.workflowRunTimeout = message.workflowRunTimeout
        ? Duration.toJSON(message.workflowRunTimeout)
        : undefined);
    message.workflowTaskTimeout !== undefined &&
      (obj.workflowTaskTimeout = message.workflowTaskTimeout
        ? Duration.toJSON(message.workflowTaskTimeout)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.workflowIdReusePolicy !== undefined &&
      (obj.workflowIdReusePolicy = workflowIdReusePolicyToJSON(
        message.workflowIdReusePolicy,
      ));
    message.signalName !== undefined && (obj.signalName = message.signalName);
    message.signalInput !== undefined &&
      (obj.signalInput = message.signalInput
        ? Payloads.toJSON(message.signalInput)
        : undefined);
    message.control !== undefined && (obj.control = message.control);
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    message.cronSchedule !== undefined &&
      (obj.cronSchedule = message.cronSchedule);
    message.memo !== undefined &&
      (obj.memo = message.memo ? Memo.toJSON(message.memo) : undefined);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<SignalWithStartWorkflowExecutionRequest>,
  ): SignalWithStartWorkflowExecutionRequest {
    const message = {
      ...baseSignalWithStartWorkflowExecutionRequest,
    } as SignalWithStartWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromPartial(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromPartial(
        object.workflowRunTimeout,
      );
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromPartial(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    if (
      object.workflowIdReusePolicy !== undefined &&
      object.workflowIdReusePolicy !== null
    ) {
      message.workflowIdReusePolicy = object.workflowIdReusePolicy;
    } else {
      message.workflowIdReusePolicy = 0;
    }
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = object.signalName;
    } else {
      message.signalName = '';
    }
    if (object.signalInput !== undefined && object.signalInput !== null) {
      message.signalInput = Payloads.fromPartial(object.signalInput);
    } else {
      message.signalInput = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = object.cronSchedule;
    } else {
      message.cronSchedule = '';
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromPartial(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromPartial(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },
};

const baseSignalWithStartWorkflowExecutionResponse: object = { runId: '' };

export const SignalWithStartWorkflowExecutionResponse = {
  encode(
    message: SignalWithStartWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.runId !== '') {
      writer.uint32(10).string(message.runId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalWithStartWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalWithStartWorkflowExecutionResponse,
    } as SignalWithStartWorkflowExecutionResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.runId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignalWithStartWorkflowExecutionResponse {
    const message = {
      ...baseSignalWithStartWorkflowExecutionResponse,
    } as SignalWithStartWorkflowExecutionResponse;
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    return message;
  },

  toJSON(message: SignalWithStartWorkflowExecutionResponse): unknown {
    const obj: any = {};
    message.runId !== undefined && (obj.runId = message.runId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<SignalWithStartWorkflowExecutionResponse>,
  ): SignalWithStartWorkflowExecutionResponse {
    const message = {
      ...baseSignalWithStartWorkflowExecutionResponse,
    } as SignalWithStartWorkflowExecutionResponse;
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    return message;
  },
};

const baseResetWorkflowExecutionRequest: object = {
  namespace: '',
  reason: '',
  workflowTaskFinishEventId: 0,
  requestId: '',
  resetReapplyType: 0,
};

export const ResetWorkflowExecutionRequest = {
  encode(
    message: ResetWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.reason !== '') {
      writer.uint32(26).string(message.reason);
    }
    if (message.workflowTaskFinishEventId !== 0) {
      writer.uint32(32).int64(message.workflowTaskFinishEventId);
    }
    if (message.requestId !== '') {
      writer.uint32(42).string(message.requestId);
    }
    if (message.resetReapplyType !== 0) {
      writer.uint32(48).int32(message.resetReapplyType);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ResetWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseResetWorkflowExecutionRequest,
    } as ResetWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.reason = reader.string();
          break;
        case 4:
          message.workflowTaskFinishEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 5:
          message.requestId = reader.string();
          break;
        case 6:
          message.resetReapplyType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResetWorkflowExecutionRequest {
    const message = {
      ...baseResetWorkflowExecutionRequest,
    } as ResetWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = String(object.reason);
    } else {
      message.reason = '';
    }
    if (
      object.workflowTaskFinishEventId !== undefined &&
      object.workflowTaskFinishEventId !== null
    ) {
      message.workflowTaskFinishEventId = Number(
        object.workflowTaskFinishEventId,
      );
    } else {
      message.workflowTaskFinishEventId = 0;
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    if (
      object.resetReapplyType !== undefined &&
      object.resetReapplyType !== null
    ) {
      message.resetReapplyType = resetReapplyTypeFromJSON(
        object.resetReapplyType,
      );
    } else {
      message.resetReapplyType = 0;
    }
    return message;
  },

  toJSON(message: ResetWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.reason !== undefined && (obj.reason = message.reason);
    message.workflowTaskFinishEventId !== undefined &&
      (obj.workflowTaskFinishEventId = message.workflowTaskFinishEventId);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.resetReapplyType !== undefined &&
      (obj.resetReapplyType = resetReapplyTypeToJSON(message.resetReapplyType));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ResetWorkflowExecutionRequest>,
  ): ResetWorkflowExecutionRequest {
    const message = {
      ...baseResetWorkflowExecutionRequest,
    } as ResetWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = object.reason;
    } else {
      message.reason = '';
    }
    if (
      object.workflowTaskFinishEventId !== undefined &&
      object.workflowTaskFinishEventId !== null
    ) {
      message.workflowTaskFinishEventId = object.workflowTaskFinishEventId;
    } else {
      message.workflowTaskFinishEventId = 0;
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    if (
      object.resetReapplyType !== undefined &&
      object.resetReapplyType !== null
    ) {
      message.resetReapplyType = object.resetReapplyType;
    } else {
      message.resetReapplyType = 0;
    }
    return message;
  },
};

const baseResetWorkflowExecutionResponse: object = { runId: '' };

export const ResetWorkflowExecutionResponse = {
  encode(
    message: ResetWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.runId !== '') {
      writer.uint32(10).string(message.runId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ResetWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseResetWorkflowExecutionResponse,
    } as ResetWorkflowExecutionResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.runId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResetWorkflowExecutionResponse {
    const message = {
      ...baseResetWorkflowExecutionResponse,
    } as ResetWorkflowExecutionResponse;
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    return message;
  },

  toJSON(message: ResetWorkflowExecutionResponse): unknown {
    const obj: any = {};
    message.runId !== undefined && (obj.runId = message.runId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ResetWorkflowExecutionResponse>,
  ): ResetWorkflowExecutionResponse {
    const message = {
      ...baseResetWorkflowExecutionResponse,
    } as ResetWorkflowExecutionResponse;
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    return message;
  },
};

const baseTerminateWorkflowExecutionRequest: object = {
  namespace: '',
  reason: '',
  identity: '',
  firstExecutionRunId: '',
};

export const TerminateWorkflowExecutionRequest = {
  encode(
    message: TerminateWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.reason !== '') {
      writer.uint32(26).string(message.reason);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(34).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(42).string(message.identity);
    }
    if (message.firstExecutionRunId !== '') {
      writer.uint32(50).string(message.firstExecutionRunId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TerminateWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseTerminateWorkflowExecutionRequest,
    } as TerminateWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.reason = reader.string();
          break;
        case 4:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 5:
          message.identity = reader.string();
          break;
        case 6:
          message.firstExecutionRunId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TerminateWorkflowExecutionRequest {
    const message = {
      ...baseTerminateWorkflowExecutionRequest,
    } as TerminateWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = String(object.reason);
    } else {
      message.reason = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (
      object.firstExecutionRunId !== undefined &&
      object.firstExecutionRunId !== null
    ) {
      message.firstExecutionRunId = String(object.firstExecutionRunId);
    } else {
      message.firstExecutionRunId = '';
    }
    return message;
  },

  toJSON(message: TerminateWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.reason !== undefined && (obj.reason = message.reason);
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.firstExecutionRunId !== undefined &&
      (obj.firstExecutionRunId = message.firstExecutionRunId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<TerminateWorkflowExecutionRequest>,
  ): TerminateWorkflowExecutionRequest {
    const message = {
      ...baseTerminateWorkflowExecutionRequest,
    } as TerminateWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = object.reason;
    } else {
      message.reason = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (
      object.firstExecutionRunId !== undefined &&
      object.firstExecutionRunId !== null
    ) {
      message.firstExecutionRunId = object.firstExecutionRunId;
    } else {
      message.firstExecutionRunId = '';
    }
    return message;
  },
};

const baseTerminateWorkflowExecutionResponse: object = {};

export const TerminateWorkflowExecutionResponse = {
  encode(
    _: TerminateWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TerminateWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseTerminateWorkflowExecutionResponse,
    } as TerminateWorkflowExecutionResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): TerminateWorkflowExecutionResponse {
    const message = {
      ...baseTerminateWorkflowExecutionResponse,
    } as TerminateWorkflowExecutionResponse;
    return message;
  },

  toJSON(_: TerminateWorkflowExecutionResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<TerminateWorkflowExecutionResponse>,
  ): TerminateWorkflowExecutionResponse {
    const message = {
      ...baseTerminateWorkflowExecutionResponse,
    } as TerminateWorkflowExecutionResponse;
    return message;
  },
};

const baseListOpenWorkflowExecutionsRequest: object = {
  namespace: '',
  maximumPageSize: 0,
};

export const ListOpenWorkflowExecutionsRequest = {
  encode(
    message: ListOpenWorkflowExecutionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.maximumPageSize !== 0) {
      writer.uint32(16).int32(message.maximumPageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(26).bytes(message.nextPageToken);
    }
    if (message.startTimeFilter !== undefined) {
      StartTimeFilter.encode(
        message.startTimeFilter,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.executionFilter !== undefined) {
      WorkflowExecutionFilter.encode(
        message.executionFilter,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.typeFilter !== undefined) {
      WorkflowTypeFilter.encode(
        message.typeFilter,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListOpenWorkflowExecutionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListOpenWorkflowExecutionsRequest,
    } as ListOpenWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.maximumPageSize = reader.int32();
          break;
        case 3:
          message.nextPageToken = reader.bytes();
          break;
        case 4:
          message.startTimeFilter = StartTimeFilter.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.executionFilter = WorkflowExecutionFilter.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.typeFilter = WorkflowTypeFilter.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListOpenWorkflowExecutionsRequest {
    const message = {
      ...baseListOpenWorkflowExecutionsRequest,
    } as ListOpenWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.maximumPageSize !== undefined &&
      object.maximumPageSize !== null
    ) {
      message.maximumPageSize = Number(object.maximumPageSize);
    } else {
      message.maximumPageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (
      object.startTimeFilter !== undefined &&
      object.startTimeFilter !== null
    ) {
      message.startTimeFilter = StartTimeFilter.fromJSON(
        object.startTimeFilter,
      );
    } else {
      message.startTimeFilter = undefined;
    }
    if (
      object.executionFilter !== undefined &&
      object.executionFilter !== null
    ) {
      message.executionFilter = WorkflowExecutionFilter.fromJSON(
        object.executionFilter,
      );
    } else {
      message.executionFilter = undefined;
    }
    if (object.typeFilter !== undefined && object.typeFilter !== null) {
      message.typeFilter = WorkflowTypeFilter.fromJSON(object.typeFilter);
    } else {
      message.typeFilter = undefined;
    }
    return message;
  },

  toJSON(message: ListOpenWorkflowExecutionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.maximumPageSize !== undefined &&
      (obj.maximumPageSize = message.maximumPageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.startTimeFilter !== undefined &&
      (obj.startTimeFilter = message.startTimeFilter
        ? StartTimeFilter.toJSON(message.startTimeFilter)
        : undefined);
    message.executionFilter !== undefined &&
      (obj.executionFilter = message.executionFilter
        ? WorkflowExecutionFilter.toJSON(message.executionFilter)
        : undefined);
    message.typeFilter !== undefined &&
      (obj.typeFilter = message.typeFilter
        ? WorkflowTypeFilter.toJSON(message.typeFilter)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListOpenWorkflowExecutionsRequest>,
  ): ListOpenWorkflowExecutionsRequest {
    const message = {
      ...baseListOpenWorkflowExecutionsRequest,
    } as ListOpenWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.maximumPageSize !== undefined &&
      object.maximumPageSize !== null
    ) {
      message.maximumPageSize = object.maximumPageSize;
    } else {
      message.maximumPageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (
      object.startTimeFilter !== undefined &&
      object.startTimeFilter !== null
    ) {
      message.startTimeFilter = StartTimeFilter.fromPartial(
        object.startTimeFilter,
      );
    } else {
      message.startTimeFilter = undefined;
    }
    if (
      object.executionFilter !== undefined &&
      object.executionFilter !== null
    ) {
      message.executionFilter = WorkflowExecutionFilter.fromPartial(
        object.executionFilter,
      );
    } else {
      message.executionFilter = undefined;
    }
    if (object.typeFilter !== undefined && object.typeFilter !== null) {
      message.typeFilter = WorkflowTypeFilter.fromPartial(object.typeFilter);
    } else {
      message.typeFilter = undefined;
    }
    return message;
  },
};

const baseListOpenWorkflowExecutionsResponse: object = {};

export const ListOpenWorkflowExecutionsResponse = {
  encode(
    message: ListOpenWorkflowExecutionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.executions) {
      WorkflowExecutionInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListOpenWorkflowExecutionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListOpenWorkflowExecutionsResponse,
    } as ListOpenWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.executions.push(
            WorkflowExecutionInfo.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListOpenWorkflowExecutionsResponse {
    const message = {
      ...baseListOpenWorkflowExecutionsResponse,
    } as ListOpenWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ListOpenWorkflowExecutionsResponse): unknown {
    const obj: any = {};
    if (message.executions) {
      obj.executions = message.executions.map((e) =>
        e ? WorkflowExecutionInfo.toJSON(e) : undefined,
      );
    } else {
      obj.executions = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListOpenWorkflowExecutionsResponse>,
  ): ListOpenWorkflowExecutionsResponse {
    const message = {
      ...baseListOpenWorkflowExecutionsResponse,
    } as ListOpenWorkflowExecutionsResponse;
    message.executions = [];
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseListClosedWorkflowExecutionsRequest: object = {
  namespace: '',
  maximumPageSize: 0,
};

export const ListClosedWorkflowExecutionsRequest = {
  encode(
    message: ListClosedWorkflowExecutionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.maximumPageSize !== 0) {
      writer.uint32(16).int32(message.maximumPageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(26).bytes(message.nextPageToken);
    }
    if (message.startTimeFilter !== undefined) {
      StartTimeFilter.encode(
        message.startTimeFilter,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.executionFilter !== undefined) {
      WorkflowExecutionFilter.encode(
        message.executionFilter,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.typeFilter !== undefined) {
      WorkflowTypeFilter.encode(
        message.typeFilter,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.statusFilter !== undefined) {
      StatusFilter.encode(
        message.statusFilter,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListClosedWorkflowExecutionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListClosedWorkflowExecutionsRequest,
    } as ListClosedWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.maximumPageSize = reader.int32();
          break;
        case 3:
          message.nextPageToken = reader.bytes();
          break;
        case 4:
          message.startTimeFilter = StartTimeFilter.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.executionFilter = WorkflowExecutionFilter.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.typeFilter = WorkflowTypeFilter.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.statusFilter = StatusFilter.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListClosedWorkflowExecutionsRequest {
    const message = {
      ...baseListClosedWorkflowExecutionsRequest,
    } as ListClosedWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.maximumPageSize !== undefined &&
      object.maximumPageSize !== null
    ) {
      message.maximumPageSize = Number(object.maximumPageSize);
    } else {
      message.maximumPageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (
      object.startTimeFilter !== undefined &&
      object.startTimeFilter !== null
    ) {
      message.startTimeFilter = StartTimeFilter.fromJSON(
        object.startTimeFilter,
      );
    } else {
      message.startTimeFilter = undefined;
    }
    if (
      object.executionFilter !== undefined &&
      object.executionFilter !== null
    ) {
      message.executionFilter = WorkflowExecutionFilter.fromJSON(
        object.executionFilter,
      );
    } else {
      message.executionFilter = undefined;
    }
    if (object.typeFilter !== undefined && object.typeFilter !== null) {
      message.typeFilter = WorkflowTypeFilter.fromJSON(object.typeFilter);
    } else {
      message.typeFilter = undefined;
    }
    if (object.statusFilter !== undefined && object.statusFilter !== null) {
      message.statusFilter = StatusFilter.fromJSON(object.statusFilter);
    } else {
      message.statusFilter = undefined;
    }
    return message;
  },

  toJSON(message: ListClosedWorkflowExecutionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.maximumPageSize !== undefined &&
      (obj.maximumPageSize = message.maximumPageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.startTimeFilter !== undefined &&
      (obj.startTimeFilter = message.startTimeFilter
        ? StartTimeFilter.toJSON(message.startTimeFilter)
        : undefined);
    message.executionFilter !== undefined &&
      (obj.executionFilter = message.executionFilter
        ? WorkflowExecutionFilter.toJSON(message.executionFilter)
        : undefined);
    message.typeFilter !== undefined &&
      (obj.typeFilter = message.typeFilter
        ? WorkflowTypeFilter.toJSON(message.typeFilter)
        : undefined);
    message.statusFilter !== undefined &&
      (obj.statusFilter = message.statusFilter
        ? StatusFilter.toJSON(message.statusFilter)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListClosedWorkflowExecutionsRequest>,
  ): ListClosedWorkflowExecutionsRequest {
    const message = {
      ...baseListClosedWorkflowExecutionsRequest,
    } as ListClosedWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.maximumPageSize !== undefined &&
      object.maximumPageSize !== null
    ) {
      message.maximumPageSize = object.maximumPageSize;
    } else {
      message.maximumPageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (
      object.startTimeFilter !== undefined &&
      object.startTimeFilter !== null
    ) {
      message.startTimeFilter = StartTimeFilter.fromPartial(
        object.startTimeFilter,
      );
    } else {
      message.startTimeFilter = undefined;
    }
    if (
      object.executionFilter !== undefined &&
      object.executionFilter !== null
    ) {
      message.executionFilter = WorkflowExecutionFilter.fromPartial(
        object.executionFilter,
      );
    } else {
      message.executionFilter = undefined;
    }
    if (object.typeFilter !== undefined && object.typeFilter !== null) {
      message.typeFilter = WorkflowTypeFilter.fromPartial(object.typeFilter);
    } else {
      message.typeFilter = undefined;
    }
    if (object.statusFilter !== undefined && object.statusFilter !== null) {
      message.statusFilter = StatusFilter.fromPartial(object.statusFilter);
    } else {
      message.statusFilter = undefined;
    }
    return message;
  },
};

const baseListClosedWorkflowExecutionsResponse: object = {};

export const ListClosedWorkflowExecutionsResponse = {
  encode(
    message: ListClosedWorkflowExecutionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.executions) {
      WorkflowExecutionInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListClosedWorkflowExecutionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListClosedWorkflowExecutionsResponse,
    } as ListClosedWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.executions.push(
            WorkflowExecutionInfo.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListClosedWorkflowExecutionsResponse {
    const message = {
      ...baseListClosedWorkflowExecutionsResponse,
    } as ListClosedWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ListClosedWorkflowExecutionsResponse): unknown {
    const obj: any = {};
    if (message.executions) {
      obj.executions = message.executions.map((e) =>
        e ? WorkflowExecutionInfo.toJSON(e) : undefined,
      );
    } else {
      obj.executions = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListClosedWorkflowExecutionsResponse>,
  ): ListClosedWorkflowExecutionsResponse {
    const message = {
      ...baseListClosedWorkflowExecutionsResponse,
    } as ListClosedWorkflowExecutionsResponse;
    message.executions = [];
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseListWorkflowExecutionsRequest: object = {
  namespace: '',
  pageSize: 0,
  query: '',
};

export const ListWorkflowExecutionsRequest = {
  encode(
    message: ListWorkflowExecutionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.pageSize !== 0) {
      writer.uint32(16).int32(message.pageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(26).bytes(message.nextPageToken);
    }
    if (message.query !== '') {
      writer.uint32(34).string(message.query);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListWorkflowExecutionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListWorkflowExecutionsRequest,
    } as ListWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.pageSize = reader.int32();
          break;
        case 3:
          message.nextPageToken = reader.bytes();
          break;
        case 4:
          message.query = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListWorkflowExecutionsRequest {
    const message = {
      ...baseListWorkflowExecutionsRequest,
    } as ListWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = Number(object.pageSize);
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = String(object.query);
    } else {
      message.query = '';
    }
    return message;
  },

  toJSON(message: ListWorkflowExecutionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.pageSize !== undefined && (obj.pageSize = message.pageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.query !== undefined && (obj.query = message.query);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListWorkflowExecutionsRequest>,
  ): ListWorkflowExecutionsRequest {
    const message = {
      ...baseListWorkflowExecutionsRequest,
    } as ListWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = object.pageSize;
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = object.query;
    } else {
      message.query = '';
    }
    return message;
  },
};

const baseListWorkflowExecutionsResponse: object = {};

export const ListWorkflowExecutionsResponse = {
  encode(
    message: ListWorkflowExecutionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.executions) {
      WorkflowExecutionInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListWorkflowExecutionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListWorkflowExecutionsResponse,
    } as ListWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.executions.push(
            WorkflowExecutionInfo.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListWorkflowExecutionsResponse {
    const message = {
      ...baseListWorkflowExecutionsResponse,
    } as ListWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ListWorkflowExecutionsResponse): unknown {
    const obj: any = {};
    if (message.executions) {
      obj.executions = message.executions.map((e) =>
        e ? WorkflowExecutionInfo.toJSON(e) : undefined,
      );
    } else {
      obj.executions = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListWorkflowExecutionsResponse>,
  ): ListWorkflowExecutionsResponse {
    const message = {
      ...baseListWorkflowExecutionsResponse,
    } as ListWorkflowExecutionsResponse;
    message.executions = [];
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseListArchivedWorkflowExecutionsRequest: object = {
  namespace: '',
  pageSize: 0,
  query: '',
};

export const ListArchivedWorkflowExecutionsRequest = {
  encode(
    message: ListArchivedWorkflowExecutionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.pageSize !== 0) {
      writer.uint32(16).int32(message.pageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(26).bytes(message.nextPageToken);
    }
    if (message.query !== '') {
      writer.uint32(34).string(message.query);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListArchivedWorkflowExecutionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListArchivedWorkflowExecutionsRequest,
    } as ListArchivedWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.pageSize = reader.int32();
          break;
        case 3:
          message.nextPageToken = reader.bytes();
          break;
        case 4:
          message.query = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListArchivedWorkflowExecutionsRequest {
    const message = {
      ...baseListArchivedWorkflowExecutionsRequest,
    } as ListArchivedWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = Number(object.pageSize);
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = String(object.query);
    } else {
      message.query = '';
    }
    return message;
  },

  toJSON(message: ListArchivedWorkflowExecutionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.pageSize !== undefined && (obj.pageSize = message.pageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.query !== undefined && (obj.query = message.query);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListArchivedWorkflowExecutionsRequest>,
  ): ListArchivedWorkflowExecutionsRequest {
    const message = {
      ...baseListArchivedWorkflowExecutionsRequest,
    } as ListArchivedWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = object.pageSize;
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = object.query;
    } else {
      message.query = '';
    }
    return message;
  },
};

const baseListArchivedWorkflowExecutionsResponse: object = {};

export const ListArchivedWorkflowExecutionsResponse = {
  encode(
    message: ListArchivedWorkflowExecutionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.executions) {
      WorkflowExecutionInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListArchivedWorkflowExecutionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListArchivedWorkflowExecutionsResponse,
    } as ListArchivedWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.executions.push(
            WorkflowExecutionInfo.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListArchivedWorkflowExecutionsResponse {
    const message = {
      ...baseListArchivedWorkflowExecutionsResponse,
    } as ListArchivedWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ListArchivedWorkflowExecutionsResponse): unknown {
    const obj: any = {};
    if (message.executions) {
      obj.executions = message.executions.map((e) =>
        e ? WorkflowExecutionInfo.toJSON(e) : undefined,
      );
    } else {
      obj.executions = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListArchivedWorkflowExecutionsResponse>,
  ): ListArchivedWorkflowExecutionsResponse {
    const message = {
      ...baseListArchivedWorkflowExecutionsResponse,
    } as ListArchivedWorkflowExecutionsResponse;
    message.executions = [];
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseScanWorkflowExecutionsRequest: object = {
  namespace: '',
  pageSize: 0,
  query: '',
};

export const ScanWorkflowExecutionsRequest = {
  encode(
    message: ScanWorkflowExecutionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.pageSize !== 0) {
      writer.uint32(16).int32(message.pageSize);
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(26).bytes(message.nextPageToken);
    }
    if (message.query !== '') {
      writer.uint32(34).string(message.query);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ScanWorkflowExecutionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseScanWorkflowExecutionsRequest,
    } as ScanWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.pageSize = reader.int32();
          break;
        case 3:
          message.nextPageToken = reader.bytes();
          break;
        case 4:
          message.query = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ScanWorkflowExecutionsRequest {
    const message = {
      ...baseScanWorkflowExecutionsRequest,
    } as ScanWorkflowExecutionsRequest;
    message.nextPageToken = new Uint8Array();
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = Number(object.pageSize);
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = String(object.query);
    } else {
      message.query = '';
    }
    return message;
  },

  toJSON(message: ScanWorkflowExecutionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.pageSize !== undefined && (obj.pageSize = message.pageSize);
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    message.query !== undefined && (obj.query = message.query);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ScanWorkflowExecutionsRequest>,
  ): ScanWorkflowExecutionsRequest {
    const message = {
      ...baseScanWorkflowExecutionsRequest,
    } as ScanWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.pageSize !== undefined && object.pageSize !== null) {
      message.pageSize = object.pageSize;
    } else {
      message.pageSize = 0;
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = object.query;
    } else {
      message.query = '';
    }
    return message;
  },
};

const baseScanWorkflowExecutionsResponse: object = {};

export const ScanWorkflowExecutionsResponse = {
  encode(
    message: ScanWorkflowExecutionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.executions) {
      WorkflowExecutionInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextPageToken.length !== 0) {
      writer.uint32(18).bytes(message.nextPageToken);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ScanWorkflowExecutionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseScanWorkflowExecutionsResponse,
    } as ScanWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.executions.push(
            WorkflowExecutionInfo.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.nextPageToken = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ScanWorkflowExecutionsResponse {
    const message = {
      ...baseScanWorkflowExecutionsResponse,
    } as ScanWorkflowExecutionsResponse;
    message.executions = [];
    message.nextPageToken = new Uint8Array();
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromJSON(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = bytesFromBase64(object.nextPageToken);
    }
    return message;
  },

  toJSON(message: ScanWorkflowExecutionsResponse): unknown {
    const obj: any = {};
    if (message.executions) {
      obj.executions = message.executions.map((e) =>
        e ? WorkflowExecutionInfo.toJSON(e) : undefined,
      );
    } else {
      obj.executions = [];
    }
    message.nextPageToken !== undefined &&
      (obj.nextPageToken = base64FromBytes(
        message.nextPageToken !== undefined
          ? message.nextPageToken
          : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ScanWorkflowExecutionsResponse>,
  ): ScanWorkflowExecutionsResponse {
    const message = {
      ...baseScanWorkflowExecutionsResponse,
    } as ScanWorkflowExecutionsResponse;
    message.executions = [];
    if (object.executions !== undefined && object.executions !== null) {
      for (const e of object.executions) {
        message.executions.push(WorkflowExecutionInfo.fromPartial(e));
      }
    }
    if (object.nextPageToken !== undefined && object.nextPageToken !== null) {
      message.nextPageToken = object.nextPageToken;
    } else {
      message.nextPageToken = new Uint8Array();
    }
    return message;
  },
};

const baseCountWorkflowExecutionsRequest: object = { namespace: '', query: '' };

export const CountWorkflowExecutionsRequest = {
  encode(
    message: CountWorkflowExecutionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.query !== '') {
      writer.uint32(18).string(message.query);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CountWorkflowExecutionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCountWorkflowExecutionsRequest,
    } as CountWorkflowExecutionsRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.query = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CountWorkflowExecutionsRequest {
    const message = {
      ...baseCountWorkflowExecutionsRequest,
    } as CountWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = String(object.query);
    } else {
      message.query = '';
    }
    return message;
  },

  toJSON(message: CountWorkflowExecutionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.query !== undefined && (obj.query = message.query);
    return obj;
  },

  fromPartial(
    object: DeepPartial<CountWorkflowExecutionsRequest>,
  ): CountWorkflowExecutionsRequest {
    const message = {
      ...baseCountWorkflowExecutionsRequest,
    } as CountWorkflowExecutionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = object.query;
    } else {
      message.query = '';
    }
    return message;
  },
};

const baseCountWorkflowExecutionsResponse: object = { count: 0 };

export const CountWorkflowExecutionsResponse = {
  encode(
    message: CountWorkflowExecutionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.count !== 0) {
      writer.uint32(8).int64(message.count);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CountWorkflowExecutionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCountWorkflowExecutionsResponse,
    } as CountWorkflowExecutionsResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.count = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CountWorkflowExecutionsResponse {
    const message = {
      ...baseCountWorkflowExecutionsResponse,
    } as CountWorkflowExecutionsResponse;
    if (object.count !== undefined && object.count !== null) {
      message.count = Number(object.count);
    } else {
      message.count = 0;
    }
    return message;
  },

  toJSON(message: CountWorkflowExecutionsResponse): unknown {
    const obj: any = {};
    message.count !== undefined && (obj.count = message.count);
    return obj;
  },

  fromPartial(
    object: DeepPartial<CountWorkflowExecutionsResponse>,
  ): CountWorkflowExecutionsResponse {
    const message = {
      ...baseCountWorkflowExecutionsResponse,
    } as CountWorkflowExecutionsResponse;
    if (object.count !== undefined && object.count !== null) {
      message.count = object.count;
    } else {
      message.count = 0;
    }
    return message;
  },
};

const baseGetSearchAttributesRequest: object = {};

export const GetSearchAttributesRequest = {
  encode(
    _: GetSearchAttributesRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetSearchAttributesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGetSearchAttributesRequest,
    } as GetSearchAttributesRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): GetSearchAttributesRequest {
    const message = {
      ...baseGetSearchAttributesRequest,
    } as GetSearchAttributesRequest;
    return message;
  },

  toJSON(_: GetSearchAttributesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<GetSearchAttributesRequest>,
  ): GetSearchAttributesRequest {
    const message = {
      ...baseGetSearchAttributesRequest,
    } as GetSearchAttributesRequest;
    return message;
  },
};

const baseGetSearchAttributesResponse: object = {};

export const GetSearchAttributesResponse = {
  encode(
    message: GetSearchAttributesResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    Object.entries(message.keys).forEach(([key, value]) => {
      GetSearchAttributesResponse_KeysEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetSearchAttributesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGetSearchAttributesResponse,
    } as GetSearchAttributesResponse;
    message.keys = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = GetSearchAttributesResponse_KeysEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry1.value !== undefined) {
            message.keys[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetSearchAttributesResponse {
    const message = {
      ...baseGetSearchAttributesResponse,
    } as GetSearchAttributesResponse;
    message.keys = {};
    if (object.keys !== undefined && object.keys !== null) {
      Object.entries(object.keys).forEach(([key, value]) => {
        message.keys[key] = value as number;
      });
    }
    return message;
  },

  toJSON(message: GetSearchAttributesResponse): unknown {
    const obj: any = {};
    obj.keys = {};
    if (message.keys) {
      Object.entries(message.keys).forEach(([k, v]) => {
        obj.keys[k] = indexedValueTypeToJSON(v);
      });
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetSearchAttributesResponse>,
  ): GetSearchAttributesResponse {
    const message = {
      ...baseGetSearchAttributesResponse,
    } as GetSearchAttributesResponse;
    message.keys = {};
    if (object.keys !== undefined && object.keys !== null) {
      Object.entries(object.keys).forEach(([key, value]) => {
        if (value !== undefined) {
          message.keys[key] = value as number;
        }
      });
    }
    return message;
  },
};

const baseGetSearchAttributesResponse_KeysEntry: object = { key: '', value: 0 };

export const GetSearchAttributesResponse_KeysEntry = {
  encode(
    message: GetSearchAttributesResponse_KeysEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int32(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetSearchAttributesResponse_KeysEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGetSearchAttributesResponse_KeysEntry,
    } as GetSearchAttributesResponse_KeysEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetSearchAttributesResponse_KeysEntry {
    const message = {
      ...baseGetSearchAttributesResponse_KeysEntry,
    } as GetSearchAttributesResponse_KeysEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = indexedValueTypeFromJSON(object.value);
    } else {
      message.value = 0;
    }
    return message;
  },

  toJSON(message: GetSearchAttributesResponse_KeysEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = indexedValueTypeToJSON(message.value));
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetSearchAttributesResponse_KeysEntry>,
  ): GetSearchAttributesResponse_KeysEntry {
    const message = {
      ...baseGetSearchAttributesResponse_KeysEntry,
    } as GetSearchAttributesResponse_KeysEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = 0;
    }
    return message;
  },
};

const baseRespondQueryTaskCompletedRequest: object = {
  completedType: 0,
  errorMessage: '',
  namespace: '',
};

export const RespondQueryTaskCompletedRequest = {
  encode(
    message: RespondQueryTaskCompletedRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskToken.length !== 0) {
      writer.uint32(10).bytes(message.taskToken);
    }
    if (message.completedType !== 0) {
      writer.uint32(16).int32(message.completedType);
    }
    if (message.queryResult !== undefined) {
      Payloads.encode(message.queryResult, writer.uint32(26).fork()).ldelim();
    }
    if (message.errorMessage !== '') {
      writer.uint32(34).string(message.errorMessage);
    }
    if (message.namespace !== '') {
      writer.uint32(50).string(message.namespace);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondQueryTaskCompletedRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondQueryTaskCompletedRequest,
    } as RespondQueryTaskCompletedRequest;
    message.taskToken = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskToken = reader.bytes();
          break;
        case 2:
          message.completedType = reader.int32() as any;
          break;
        case 3:
          message.queryResult = Payloads.decode(reader, reader.uint32());
          break;
        case 4:
          message.errorMessage = reader.string();
          break;
        case 6:
          message.namespace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RespondQueryTaskCompletedRequest {
    const message = {
      ...baseRespondQueryTaskCompletedRequest,
    } as RespondQueryTaskCompletedRequest;
    message.taskToken = new Uint8Array();
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = bytesFromBase64(object.taskToken);
    }
    if (object.completedType !== undefined && object.completedType !== null) {
      message.completedType = queryResultTypeFromJSON(object.completedType);
    } else {
      message.completedType = 0;
    }
    if (object.queryResult !== undefined && object.queryResult !== null) {
      message.queryResult = Payloads.fromJSON(object.queryResult);
    } else {
      message.queryResult = undefined;
    }
    if (object.errorMessage !== undefined && object.errorMessage !== null) {
      message.errorMessage = String(object.errorMessage);
    } else {
      message.errorMessage = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    return message;
  },

  toJSON(message: RespondQueryTaskCompletedRequest): unknown {
    const obj: any = {};
    message.taskToken !== undefined &&
      (obj.taskToken = base64FromBytes(
        message.taskToken !== undefined ? message.taskToken : new Uint8Array(),
      ));
    message.completedType !== undefined &&
      (obj.completedType = queryResultTypeToJSON(message.completedType));
    message.queryResult !== undefined &&
      (obj.queryResult = message.queryResult
        ? Payloads.toJSON(message.queryResult)
        : undefined);
    message.errorMessage !== undefined &&
      (obj.errorMessage = message.errorMessage);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RespondQueryTaskCompletedRequest>,
  ): RespondQueryTaskCompletedRequest {
    const message = {
      ...baseRespondQueryTaskCompletedRequest,
    } as RespondQueryTaskCompletedRequest;
    if (object.taskToken !== undefined && object.taskToken !== null) {
      message.taskToken = object.taskToken;
    } else {
      message.taskToken = new Uint8Array();
    }
    if (object.completedType !== undefined && object.completedType !== null) {
      message.completedType = object.completedType;
    } else {
      message.completedType = 0;
    }
    if (object.queryResult !== undefined && object.queryResult !== null) {
      message.queryResult = Payloads.fromPartial(object.queryResult);
    } else {
      message.queryResult = undefined;
    }
    if (object.errorMessage !== undefined && object.errorMessage !== null) {
      message.errorMessage = object.errorMessage;
    } else {
      message.errorMessage = '';
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    return message;
  },
};

const baseRespondQueryTaskCompletedResponse: object = {};

export const RespondQueryTaskCompletedResponse = {
  encode(
    _: RespondQueryTaskCompletedResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RespondQueryTaskCompletedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRespondQueryTaskCompletedResponse,
    } as RespondQueryTaskCompletedResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): RespondQueryTaskCompletedResponse {
    const message = {
      ...baseRespondQueryTaskCompletedResponse,
    } as RespondQueryTaskCompletedResponse;
    return message;
  },

  toJSON(_: RespondQueryTaskCompletedResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<RespondQueryTaskCompletedResponse>,
  ): RespondQueryTaskCompletedResponse {
    const message = {
      ...baseRespondQueryTaskCompletedResponse,
    } as RespondQueryTaskCompletedResponse;
    return message;
  },
};

const baseResetStickyTaskQueueRequest: object = { namespace: '' };

export const ResetStickyTaskQueueRequest = {
  encode(
    message: ResetStickyTaskQueueRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.execution !== undefined) {
      WorkflowExecution.encode(
        message.execution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ResetStickyTaskQueueRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseResetStickyTaskQueueRequest,
    } as ResetStickyTaskQueueRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.execution = WorkflowExecution.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResetStickyTaskQueueRequest {
    const message = {
      ...baseResetStickyTaskQueueRequest,
    } as ResetStickyTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromJSON(object.execution);
    } else {
      message.execution = undefined;
    }
    return message;
  },

  toJSON(message: ResetStickyTaskQueueRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.execution !== undefined &&
      (obj.execution = message.execution
        ? WorkflowExecution.toJSON(message.execution)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ResetStickyTaskQueueRequest>,
  ): ResetStickyTaskQueueRequest {
    const message = {
      ...baseResetStickyTaskQueueRequest,
    } as ResetStickyTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromPartial(object.execution);
    } else {
      message.execution = undefined;
    }
    return message;
  },
};

const baseResetStickyTaskQueueResponse: object = {};

export const ResetStickyTaskQueueResponse = {
  encode(
    _: ResetStickyTaskQueueResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ResetStickyTaskQueueResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseResetStickyTaskQueueResponse,
    } as ResetStickyTaskQueueResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): ResetStickyTaskQueueResponse {
    const message = {
      ...baseResetStickyTaskQueueResponse,
    } as ResetStickyTaskQueueResponse;
    return message;
  },

  toJSON(_: ResetStickyTaskQueueResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<ResetStickyTaskQueueResponse>,
  ): ResetStickyTaskQueueResponse {
    const message = {
      ...baseResetStickyTaskQueueResponse,
    } as ResetStickyTaskQueueResponse;
    return message;
  },
};

const baseQueryWorkflowRequest: object = {
  namespace: '',
  queryRejectCondition: 0,
};

export const QueryWorkflowRequest = {
  encode(
    message: QueryWorkflowRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.execution !== undefined) {
      WorkflowExecution.encode(
        message.execution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.query !== undefined) {
      WorkflowQuery.encode(message.query, writer.uint32(26).fork()).ldelim();
    }
    if (message.queryRejectCondition !== 0) {
      writer.uint32(32).int32(message.queryRejectCondition);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryWorkflowRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryWorkflowRequest } as QueryWorkflowRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.execution = WorkflowExecution.decode(reader, reader.uint32());
          break;
        case 3:
          message.query = WorkflowQuery.decode(reader, reader.uint32());
          break;
        case 4:
          message.queryRejectCondition = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryWorkflowRequest {
    const message = { ...baseQueryWorkflowRequest } as QueryWorkflowRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromJSON(object.execution);
    } else {
      message.execution = undefined;
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = WorkflowQuery.fromJSON(object.query);
    } else {
      message.query = undefined;
    }
    if (
      object.queryRejectCondition !== undefined &&
      object.queryRejectCondition !== null
    ) {
      message.queryRejectCondition = queryRejectConditionFromJSON(
        object.queryRejectCondition,
      );
    } else {
      message.queryRejectCondition = 0;
    }
    return message;
  },

  toJSON(message: QueryWorkflowRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.execution !== undefined &&
      (obj.execution = message.execution
        ? WorkflowExecution.toJSON(message.execution)
        : undefined);
    message.query !== undefined &&
      (obj.query = message.query
        ? WorkflowQuery.toJSON(message.query)
        : undefined);
    message.queryRejectCondition !== undefined &&
      (obj.queryRejectCondition = queryRejectConditionToJSON(
        message.queryRejectCondition,
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<QueryWorkflowRequest>): QueryWorkflowRequest {
    const message = { ...baseQueryWorkflowRequest } as QueryWorkflowRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromPartial(object.execution);
    } else {
      message.execution = undefined;
    }
    if (object.query !== undefined && object.query !== null) {
      message.query = WorkflowQuery.fromPartial(object.query);
    } else {
      message.query = undefined;
    }
    if (
      object.queryRejectCondition !== undefined &&
      object.queryRejectCondition !== null
    ) {
      message.queryRejectCondition = object.queryRejectCondition;
    } else {
      message.queryRejectCondition = 0;
    }
    return message;
  },
};

const baseQueryWorkflowResponse: object = {};

export const QueryWorkflowResponse = {
  encode(
    message: QueryWorkflowResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryResult !== undefined) {
      Payloads.encode(message.queryResult, writer.uint32(10).fork()).ldelim();
    }
    if (message.queryRejected !== undefined) {
      QueryRejected.encode(
        message.queryRejected,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): QueryWorkflowResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryWorkflowResponse } as QueryWorkflowResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.queryResult = Payloads.decode(reader, reader.uint32());
          break;
        case 2:
          message.queryRejected = QueryRejected.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryWorkflowResponse {
    const message = { ...baseQueryWorkflowResponse } as QueryWorkflowResponse;
    if (object.queryResult !== undefined && object.queryResult !== null) {
      message.queryResult = Payloads.fromJSON(object.queryResult);
    } else {
      message.queryResult = undefined;
    }
    if (object.queryRejected !== undefined && object.queryRejected !== null) {
      message.queryRejected = QueryRejected.fromJSON(object.queryRejected);
    } else {
      message.queryRejected = undefined;
    }
    return message;
  },

  toJSON(message: QueryWorkflowResponse): unknown {
    const obj: any = {};
    message.queryResult !== undefined &&
      (obj.queryResult = message.queryResult
        ? Payloads.toJSON(message.queryResult)
        : undefined);
    message.queryRejected !== undefined &&
      (obj.queryRejected = message.queryRejected
        ? QueryRejected.toJSON(message.queryRejected)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryWorkflowResponse>,
  ): QueryWorkflowResponse {
    const message = { ...baseQueryWorkflowResponse } as QueryWorkflowResponse;
    if (object.queryResult !== undefined && object.queryResult !== null) {
      message.queryResult = Payloads.fromPartial(object.queryResult);
    } else {
      message.queryResult = undefined;
    }
    if (object.queryRejected !== undefined && object.queryRejected !== null) {
      message.queryRejected = QueryRejected.fromPartial(object.queryRejected);
    } else {
      message.queryRejected = undefined;
    }
    return message;
  },
};

const baseDescribeWorkflowExecutionRequest: object = { namespace: '' };

export const DescribeWorkflowExecutionRequest = {
  encode(
    message: DescribeWorkflowExecutionRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.execution !== undefined) {
      WorkflowExecution.encode(
        message.execution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DescribeWorkflowExecutionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDescribeWorkflowExecutionRequest,
    } as DescribeWorkflowExecutionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.execution = WorkflowExecution.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DescribeWorkflowExecutionRequest {
    const message = {
      ...baseDescribeWorkflowExecutionRequest,
    } as DescribeWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromJSON(object.execution);
    } else {
      message.execution = undefined;
    }
    return message;
  },

  toJSON(message: DescribeWorkflowExecutionRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.execution !== undefined &&
      (obj.execution = message.execution
        ? WorkflowExecution.toJSON(message.execution)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DescribeWorkflowExecutionRequest>,
  ): DescribeWorkflowExecutionRequest {
    const message = {
      ...baseDescribeWorkflowExecutionRequest,
    } as DescribeWorkflowExecutionRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromPartial(object.execution);
    } else {
      message.execution = undefined;
    }
    return message;
  },
};

const baseDescribeWorkflowExecutionResponse: object = {};

export const DescribeWorkflowExecutionResponse = {
  encode(
    message: DescribeWorkflowExecutionResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.executionConfig !== undefined) {
      WorkflowExecutionConfig.encode(
        message.executionConfig,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionInfo !== undefined) {
      WorkflowExecutionInfo.encode(
        message.workflowExecutionInfo,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    for (const v of message.pendingActivities) {
      PendingActivityInfo.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.pendingChildren) {
      PendingChildExecutionInfo.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DescribeWorkflowExecutionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDescribeWorkflowExecutionResponse,
    } as DescribeWorkflowExecutionResponse;
    message.pendingActivities = [];
    message.pendingChildren = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.executionConfig = WorkflowExecutionConfig.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.workflowExecutionInfo = WorkflowExecutionInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.pendingActivities.push(
            PendingActivityInfo.decode(reader, reader.uint32()),
          );
          break;
        case 4:
          message.pendingChildren.push(
            PendingChildExecutionInfo.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DescribeWorkflowExecutionResponse {
    const message = {
      ...baseDescribeWorkflowExecutionResponse,
    } as DescribeWorkflowExecutionResponse;
    message.pendingActivities = [];
    message.pendingChildren = [];
    if (
      object.executionConfig !== undefined &&
      object.executionConfig !== null
    ) {
      message.executionConfig = WorkflowExecutionConfig.fromJSON(
        object.executionConfig,
      );
    } else {
      message.executionConfig = undefined;
    }
    if (
      object.workflowExecutionInfo !== undefined &&
      object.workflowExecutionInfo !== null
    ) {
      message.workflowExecutionInfo = WorkflowExecutionInfo.fromJSON(
        object.workflowExecutionInfo,
      );
    } else {
      message.workflowExecutionInfo = undefined;
    }
    if (
      object.pendingActivities !== undefined &&
      object.pendingActivities !== null
    ) {
      for (const e of object.pendingActivities) {
        message.pendingActivities.push(PendingActivityInfo.fromJSON(e));
      }
    }
    if (
      object.pendingChildren !== undefined &&
      object.pendingChildren !== null
    ) {
      for (const e of object.pendingChildren) {
        message.pendingChildren.push(PendingChildExecutionInfo.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: DescribeWorkflowExecutionResponse): unknown {
    const obj: any = {};
    message.executionConfig !== undefined &&
      (obj.executionConfig = message.executionConfig
        ? WorkflowExecutionConfig.toJSON(message.executionConfig)
        : undefined);
    message.workflowExecutionInfo !== undefined &&
      (obj.workflowExecutionInfo = message.workflowExecutionInfo
        ? WorkflowExecutionInfo.toJSON(message.workflowExecutionInfo)
        : undefined);
    if (message.pendingActivities) {
      obj.pendingActivities = message.pendingActivities.map((e) =>
        e ? PendingActivityInfo.toJSON(e) : undefined,
      );
    } else {
      obj.pendingActivities = [];
    }
    if (message.pendingChildren) {
      obj.pendingChildren = message.pendingChildren.map((e) =>
        e ? PendingChildExecutionInfo.toJSON(e) : undefined,
      );
    } else {
      obj.pendingChildren = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<DescribeWorkflowExecutionResponse>,
  ): DescribeWorkflowExecutionResponse {
    const message = {
      ...baseDescribeWorkflowExecutionResponse,
    } as DescribeWorkflowExecutionResponse;
    message.pendingActivities = [];
    message.pendingChildren = [];
    if (
      object.executionConfig !== undefined &&
      object.executionConfig !== null
    ) {
      message.executionConfig = WorkflowExecutionConfig.fromPartial(
        object.executionConfig,
      );
    } else {
      message.executionConfig = undefined;
    }
    if (
      object.workflowExecutionInfo !== undefined &&
      object.workflowExecutionInfo !== null
    ) {
      message.workflowExecutionInfo = WorkflowExecutionInfo.fromPartial(
        object.workflowExecutionInfo,
      );
    } else {
      message.workflowExecutionInfo = undefined;
    }
    if (
      object.pendingActivities !== undefined &&
      object.pendingActivities !== null
    ) {
      for (const e of object.pendingActivities) {
        message.pendingActivities.push(PendingActivityInfo.fromPartial(e));
      }
    }
    if (
      object.pendingChildren !== undefined &&
      object.pendingChildren !== null
    ) {
      for (const e of object.pendingChildren) {
        message.pendingChildren.push(PendingChildExecutionInfo.fromPartial(e));
      }
    }
    return message;
  },
};

const baseDescribeTaskQueueRequest: object = {
  namespace: '',
  taskQueueType: 0,
  includeTaskQueueStatus: false,
};

export const DescribeTaskQueueRequest = {
  encode(
    message: DescribeTaskQueueRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(18).fork()).ldelim();
    }
    if (message.taskQueueType !== 0) {
      writer.uint32(24).int32(message.taskQueueType);
    }
    if (message.includeTaskQueueStatus === true) {
      writer.uint32(32).bool(message.includeTaskQueueStatus);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DescribeTaskQueueRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDescribeTaskQueueRequest,
    } as DescribeTaskQueueRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 3:
          message.taskQueueType = reader.int32() as any;
          break;
        case 4:
          message.includeTaskQueueStatus = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DescribeTaskQueueRequest {
    const message = {
      ...baseDescribeTaskQueueRequest,
    } as DescribeTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.taskQueueType !== undefined && object.taskQueueType !== null) {
      message.taskQueueType = taskQueueTypeFromJSON(object.taskQueueType);
    } else {
      message.taskQueueType = 0;
    }
    if (
      object.includeTaskQueueStatus !== undefined &&
      object.includeTaskQueueStatus !== null
    ) {
      message.includeTaskQueueStatus = Boolean(object.includeTaskQueueStatus);
    } else {
      message.includeTaskQueueStatus = false;
    }
    return message;
  },

  toJSON(message: DescribeTaskQueueRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.taskQueueType !== undefined &&
      (obj.taskQueueType = taskQueueTypeToJSON(message.taskQueueType));
    message.includeTaskQueueStatus !== undefined &&
      (obj.includeTaskQueueStatus = message.includeTaskQueueStatus);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DescribeTaskQueueRequest>,
  ): DescribeTaskQueueRequest {
    const message = {
      ...baseDescribeTaskQueueRequest,
    } as DescribeTaskQueueRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.taskQueueType !== undefined && object.taskQueueType !== null) {
      message.taskQueueType = object.taskQueueType;
    } else {
      message.taskQueueType = 0;
    }
    if (
      object.includeTaskQueueStatus !== undefined &&
      object.includeTaskQueueStatus !== null
    ) {
      message.includeTaskQueueStatus = object.includeTaskQueueStatus;
    } else {
      message.includeTaskQueueStatus = false;
    }
    return message;
  },
};

const baseDescribeTaskQueueResponse: object = {};

export const DescribeTaskQueueResponse = {
  encode(
    message: DescribeTaskQueueResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.pollers) {
      PollerInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.taskQueueStatus !== undefined) {
      TaskQueueStatus.encode(
        message.taskQueueStatus,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DescribeTaskQueueResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDescribeTaskQueueResponse,
    } as DescribeTaskQueueResponse;
    message.pollers = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pollers.push(PollerInfo.decode(reader, reader.uint32()));
          break;
        case 2:
          message.taskQueueStatus = TaskQueueStatus.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DescribeTaskQueueResponse {
    const message = {
      ...baseDescribeTaskQueueResponse,
    } as DescribeTaskQueueResponse;
    message.pollers = [];
    if (object.pollers !== undefined && object.pollers !== null) {
      for (const e of object.pollers) {
        message.pollers.push(PollerInfo.fromJSON(e));
      }
    }
    if (
      object.taskQueueStatus !== undefined &&
      object.taskQueueStatus !== null
    ) {
      message.taskQueueStatus = TaskQueueStatus.fromJSON(
        object.taskQueueStatus,
      );
    } else {
      message.taskQueueStatus = undefined;
    }
    return message;
  },

  toJSON(message: DescribeTaskQueueResponse): unknown {
    const obj: any = {};
    if (message.pollers) {
      obj.pollers = message.pollers.map((e) =>
        e ? PollerInfo.toJSON(e) : undefined,
      );
    } else {
      obj.pollers = [];
    }
    message.taskQueueStatus !== undefined &&
      (obj.taskQueueStatus = message.taskQueueStatus
        ? TaskQueueStatus.toJSON(message.taskQueueStatus)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DescribeTaskQueueResponse>,
  ): DescribeTaskQueueResponse {
    const message = {
      ...baseDescribeTaskQueueResponse,
    } as DescribeTaskQueueResponse;
    message.pollers = [];
    if (object.pollers !== undefined && object.pollers !== null) {
      for (const e of object.pollers) {
        message.pollers.push(PollerInfo.fromPartial(e));
      }
    }
    if (
      object.taskQueueStatus !== undefined &&
      object.taskQueueStatus !== null
    ) {
      message.taskQueueStatus = TaskQueueStatus.fromPartial(
        object.taskQueueStatus,
      );
    } else {
      message.taskQueueStatus = undefined;
    }
    return message;
  },
};

const baseGetClusterInfoRequest: object = {};

export const GetClusterInfoRequest = {
  encode(
    _: GetClusterInfoRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetClusterInfoRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGetClusterInfoRequest } as GetClusterInfoRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): GetClusterInfoRequest {
    const message = { ...baseGetClusterInfoRequest } as GetClusterInfoRequest;
    return message;
  },

  toJSON(_: GetClusterInfoRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<GetClusterInfoRequest>): GetClusterInfoRequest {
    const message = { ...baseGetClusterInfoRequest } as GetClusterInfoRequest;
    return message;
  },
};

const baseGetClusterInfoResponse: object = {
  serverVersion: '',
  clusterId: '',
  clusterName: '',
  historyShardCount: 0,
};

export const GetClusterInfoResponse = {
  encode(
    message: GetClusterInfoResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    Object.entries(message.supportedClients).forEach(([key, value]) => {
      GetClusterInfoResponse_SupportedClientsEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    if (message.serverVersion !== '') {
      writer.uint32(18).string(message.serverVersion);
    }
    if (message.clusterId !== '') {
      writer.uint32(26).string(message.clusterId);
    }
    if (message.versionInfo !== undefined) {
      VersionInfo.encode(
        message.versionInfo,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.clusterName !== '') {
      writer.uint32(42).string(message.clusterName);
    }
    if (message.historyShardCount !== 0) {
      writer.uint32(48).int32(message.historyShardCount);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetClusterInfoResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGetClusterInfoResponse } as GetClusterInfoResponse;
    message.supportedClients = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = GetClusterInfoResponse_SupportedClientsEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry1.value !== undefined) {
            message.supportedClients[entry1.key] = entry1.value;
          }
          break;
        case 2:
          message.serverVersion = reader.string();
          break;
        case 3:
          message.clusterId = reader.string();
          break;
        case 4:
          message.versionInfo = VersionInfo.decode(reader, reader.uint32());
          break;
        case 5:
          message.clusterName = reader.string();
          break;
        case 6:
          message.historyShardCount = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetClusterInfoResponse {
    const message = { ...baseGetClusterInfoResponse } as GetClusterInfoResponse;
    message.supportedClients = {};
    if (
      object.supportedClients !== undefined &&
      object.supportedClients !== null
    ) {
      Object.entries(object.supportedClients).forEach(([key, value]) => {
        message.supportedClients[key] = String(value);
      });
    }
    if (object.serverVersion !== undefined && object.serverVersion !== null) {
      message.serverVersion = String(object.serverVersion);
    } else {
      message.serverVersion = '';
    }
    if (object.clusterId !== undefined && object.clusterId !== null) {
      message.clusterId = String(object.clusterId);
    } else {
      message.clusterId = '';
    }
    if (object.versionInfo !== undefined && object.versionInfo !== null) {
      message.versionInfo = VersionInfo.fromJSON(object.versionInfo);
    } else {
      message.versionInfo = undefined;
    }
    if (object.clusterName !== undefined && object.clusterName !== null) {
      message.clusterName = String(object.clusterName);
    } else {
      message.clusterName = '';
    }
    if (
      object.historyShardCount !== undefined &&
      object.historyShardCount !== null
    ) {
      message.historyShardCount = Number(object.historyShardCount);
    } else {
      message.historyShardCount = 0;
    }
    return message;
  },

  toJSON(message: GetClusterInfoResponse): unknown {
    const obj: any = {};
    obj.supportedClients = {};
    if (message.supportedClients) {
      Object.entries(message.supportedClients).forEach(([k, v]) => {
        obj.supportedClients[k] = v;
      });
    }
    message.serverVersion !== undefined &&
      (obj.serverVersion = message.serverVersion);
    message.clusterId !== undefined && (obj.clusterId = message.clusterId);
    message.versionInfo !== undefined &&
      (obj.versionInfo = message.versionInfo
        ? VersionInfo.toJSON(message.versionInfo)
        : undefined);
    message.clusterName !== undefined &&
      (obj.clusterName = message.clusterName);
    message.historyShardCount !== undefined &&
      (obj.historyShardCount = message.historyShardCount);
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetClusterInfoResponse>,
  ): GetClusterInfoResponse {
    const message = { ...baseGetClusterInfoResponse } as GetClusterInfoResponse;
    message.supportedClients = {};
    if (
      object.supportedClients !== undefined &&
      object.supportedClients !== null
    ) {
      Object.entries(object.supportedClients).forEach(([key, value]) => {
        if (value !== undefined) {
          message.supportedClients[key] = String(value);
        }
      });
    }
    if (object.serverVersion !== undefined && object.serverVersion !== null) {
      message.serverVersion = object.serverVersion;
    } else {
      message.serverVersion = '';
    }
    if (object.clusterId !== undefined && object.clusterId !== null) {
      message.clusterId = object.clusterId;
    } else {
      message.clusterId = '';
    }
    if (object.versionInfo !== undefined && object.versionInfo !== null) {
      message.versionInfo = VersionInfo.fromPartial(object.versionInfo);
    } else {
      message.versionInfo = undefined;
    }
    if (object.clusterName !== undefined && object.clusterName !== null) {
      message.clusterName = object.clusterName;
    } else {
      message.clusterName = '';
    }
    if (
      object.historyShardCount !== undefined &&
      object.historyShardCount !== null
    ) {
      message.historyShardCount = object.historyShardCount;
    } else {
      message.historyShardCount = 0;
    }
    return message;
  },
};

const baseGetClusterInfoResponse_SupportedClientsEntry: object = {
  key: '',
  value: '',
};

export const GetClusterInfoResponse_SupportedClientsEntry = {
  encode(
    message: GetClusterInfoResponse_SupportedClientsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): GetClusterInfoResponse_SupportedClientsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGetClusterInfoResponse_SupportedClientsEntry,
    } as GetClusterInfoResponse_SupportedClientsEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetClusterInfoResponse_SupportedClientsEntry {
    const message = {
      ...baseGetClusterInfoResponse_SupportedClientsEntry,
    } as GetClusterInfoResponse_SupportedClientsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = String(object.value);
    } else {
      message.value = '';
    }
    return message;
  },

  toJSON(message: GetClusterInfoResponse_SupportedClientsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetClusterInfoResponse_SupportedClientsEntry>,
  ): GetClusterInfoResponse_SupportedClientsEntry {
    const message = {
      ...baseGetClusterInfoResponse_SupportedClientsEntry,
    } as GetClusterInfoResponse_SupportedClientsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = '';
    }
    return message;
  },
};

const baseListTaskQueuePartitionsRequest: object = { namespace: '' };

export const ListTaskQueuePartitionsRequest = {
  encode(
    message: ListTaskQueuePartitionsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListTaskQueuePartitionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListTaskQueuePartitionsRequest,
    } as ListTaskQueuePartitionsRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListTaskQueuePartitionsRequest {
    const message = {
      ...baseListTaskQueuePartitionsRequest,
    } as ListTaskQueuePartitionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    return message;
  },

  toJSON(message: ListTaskQueuePartitionsRequest): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListTaskQueuePartitionsRequest>,
  ): ListTaskQueuePartitionsRequest {
    const message = {
      ...baseListTaskQueuePartitionsRequest,
    } as ListTaskQueuePartitionsRequest;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    return message;
  },
};

const baseListTaskQueuePartitionsResponse: object = {};

export const ListTaskQueuePartitionsResponse = {
  encode(
    message: ListTaskQueuePartitionsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.activityTaskQueuePartitions) {
      TaskQueuePartitionMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.workflowTaskQueuePartitions) {
      TaskQueuePartitionMetadata.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListTaskQueuePartitionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseListTaskQueuePartitionsResponse,
    } as ListTaskQueuePartitionsResponse;
    message.activityTaskQueuePartitions = [];
    message.workflowTaskQueuePartitions = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.activityTaskQueuePartitions.push(
            TaskQueuePartitionMetadata.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.workflowTaskQueuePartitions.push(
            TaskQueuePartitionMetadata.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListTaskQueuePartitionsResponse {
    const message = {
      ...baseListTaskQueuePartitionsResponse,
    } as ListTaskQueuePartitionsResponse;
    message.activityTaskQueuePartitions = [];
    message.workflowTaskQueuePartitions = [];
    if (
      object.activityTaskQueuePartitions !== undefined &&
      object.activityTaskQueuePartitions !== null
    ) {
      for (const e of object.activityTaskQueuePartitions) {
        message.activityTaskQueuePartitions.push(
          TaskQueuePartitionMetadata.fromJSON(e),
        );
      }
    }
    if (
      object.workflowTaskQueuePartitions !== undefined &&
      object.workflowTaskQueuePartitions !== null
    ) {
      for (const e of object.workflowTaskQueuePartitions) {
        message.workflowTaskQueuePartitions.push(
          TaskQueuePartitionMetadata.fromJSON(e),
        );
      }
    }
    return message;
  },

  toJSON(message: ListTaskQueuePartitionsResponse): unknown {
    const obj: any = {};
    if (message.activityTaskQueuePartitions) {
      obj.activityTaskQueuePartitions = message.activityTaskQueuePartitions.map(
        (e) => (e ? TaskQueuePartitionMetadata.toJSON(e) : undefined),
      );
    } else {
      obj.activityTaskQueuePartitions = [];
    }
    if (message.workflowTaskQueuePartitions) {
      obj.workflowTaskQueuePartitions = message.workflowTaskQueuePartitions.map(
        (e) => (e ? TaskQueuePartitionMetadata.toJSON(e) : undefined),
      );
    } else {
      obj.workflowTaskQueuePartitions = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListTaskQueuePartitionsResponse>,
  ): ListTaskQueuePartitionsResponse {
    const message = {
      ...baseListTaskQueuePartitionsResponse,
    } as ListTaskQueuePartitionsResponse;
    message.activityTaskQueuePartitions = [];
    message.workflowTaskQueuePartitions = [];
    if (
      object.activityTaskQueuePartitions !== undefined &&
      object.activityTaskQueuePartitions !== null
    ) {
      for (const e of object.activityTaskQueuePartitions) {
        message.activityTaskQueuePartitions.push(
          TaskQueuePartitionMetadata.fromPartial(e),
        );
      }
    }
    if (
      object.workflowTaskQueuePartitions !== undefined &&
      object.workflowTaskQueuePartitions !== null
    ) {
      for (const e of object.workflowTaskQueuePartitions) {
        message.workflowTaskQueuePartitions.push(
          TaskQueuePartitionMetadata.fromPartial(e),
        );
      }
    }
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw 'Unable to locate global object';
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, 'base64').toString('binary'));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, 'binary').toString('base64'));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (const byte of arr) {
    bin.push(String.fromCharCode(byte));
  }
  return btoa(bin.join(''));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === 'string') {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
