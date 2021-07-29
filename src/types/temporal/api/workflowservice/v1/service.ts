/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  RegisterNamespaceResponse,
  DescribeNamespaceResponse,
  ListNamespacesResponse,
  UpdateNamespaceResponse,
  DeprecateNamespaceResponse,
  StartWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  PollWorkflowTaskQueueResponse,
  RespondWorkflowTaskCompletedResponse,
  RespondWorkflowTaskFailedResponse,
  PollActivityTaskQueueResponse,
  RecordActivityTaskHeartbeatResponse,
  RecordActivityTaskHeartbeatByIdResponse,
  RespondActivityTaskCompletedResponse,
  RespondActivityTaskCompletedByIdResponse,
  RespondActivityTaskFailedResponse,
  RespondActivityTaskFailedByIdResponse,
  RespondActivityTaskCanceledResponse,
  RespondActivityTaskCanceledByIdResponse,
  RequestCancelWorkflowExecutionResponse,
  SignalWorkflowExecutionResponse,
  SignalWithStartWorkflowExecutionResponse,
  ResetWorkflowExecutionResponse,
  TerminateWorkflowExecutionResponse,
  ListOpenWorkflowExecutionsResponse,
  ListClosedWorkflowExecutionsResponse,
  ListWorkflowExecutionsResponse,
  ListArchivedWorkflowExecutionsResponse,
  ScanWorkflowExecutionsResponse,
  CountWorkflowExecutionsResponse,
  GetSearchAttributesResponse,
  RespondQueryTaskCompletedResponse,
  ResetStickyTaskQueueResponse,
  QueryWorkflowResponse,
  DescribeWorkflowExecutionResponse,
  DescribeTaskQueueResponse,
  GetClusterInfoResponse,
  ListTaskQueuePartitionsResponse,
  RegisterNamespaceRequest,
  DescribeNamespaceRequest,
  ListNamespacesRequest,
  UpdateNamespaceRequest,
  DeprecateNamespaceRequest,
  StartWorkflowExecutionRequest,
  GetWorkflowExecutionHistoryRequest,
  PollWorkflowTaskQueueRequest,
  RespondWorkflowTaskCompletedRequest,
  RespondWorkflowTaskFailedRequest,
  PollActivityTaskQueueRequest,
  RecordActivityTaskHeartbeatRequest,
  RecordActivityTaskHeartbeatByIdRequest,
  RespondActivityTaskCompletedRequest,
  RespondActivityTaskCompletedByIdRequest,
  RespondActivityTaskFailedRequest,
  RespondActivityTaskFailedByIdRequest,
  RespondActivityTaskCanceledRequest,
  RespondActivityTaskCanceledByIdRequest,
  RequestCancelWorkflowExecutionRequest,
  SignalWorkflowExecutionRequest,
  SignalWithStartWorkflowExecutionRequest,
  ResetWorkflowExecutionRequest,
  TerminateWorkflowExecutionRequest,
  ListOpenWorkflowExecutionsRequest,
  ListClosedWorkflowExecutionsRequest,
  ListWorkflowExecutionsRequest,
  ListArchivedWorkflowExecutionsRequest,
  ScanWorkflowExecutionsRequest,
  CountWorkflowExecutionsRequest,
  GetSearchAttributesRequest,
  RespondQueryTaskCompletedRequest,
  ResetStickyTaskQueueRequest,
  QueryWorkflowRequest,
  DescribeWorkflowExecutionRequest,
  DescribeTaskQueueRequest,
  GetClusterInfoRequest,
  ListTaskQueuePartitionsRequest,
} from '../../../../temporal/api/workflowservice/v1/request_response';

export const protobufPackage = 'temporal.api.workflowservice.v1';

/**
 * WorkflowService API is exposed to provide support for long running applications.  Application is expected to call
 * StartWorkflowExecution to create an instance for each instance of long running workflow.  Such applications are expected
 * to have a worker which regularly polls for WorkflowTask and ActivityTask from the WorkflowService.  For each
 * WorkflowTask, application is expected to process the history of events for that session and respond back with next
 * commands.  For each ActivityTask, application is expected to execute the actual logic for that task and respond back
 * with completion or failure.  Worker is expected to regularly heartbeat while activity task is running.
 */
export interface WorkflowService {
  /**
   * RegisterNamespace creates a new namespace which can be used as a container for all resources.  Namespace is a top level
   * entity within Temporal, used as a container for all resources like workflow executions, task queues, etc.  Namespace
   * acts as a sandbox and provides isolation for all resources within the namespace.  All resources belongs to exactly one
   * namespace.
   */
  RegisterNamespace(
    request: RegisterNamespaceRequest,
  ): Promise<RegisterNamespaceResponse>;
  /** DescribeNamespace returns the information and configuration for a registered namespace. */
  DescribeNamespace(
    request: DescribeNamespaceRequest,
  ): Promise<DescribeNamespaceResponse>;
  /** ListNamespaces returns the information and configuration for all namespaces. */
  ListNamespaces(
    request: ListNamespacesRequest,
  ): Promise<ListNamespacesResponse>;
  /**
   * (-- api-linter: core::0134::method-signature=disabled
   *     aip.dev/not-precedent: UpdateNamespace RPC doesn't follow Google API format. --)
   * (-- api-linter: core::0134::response-message-name=disabled
   *     aip.dev/not-precedent: UpdateNamespace RPC doesn't follow Google API format. --)
   * UpdateNamespace is used to update the information and configuration for a registered namespace.
   */
  UpdateNamespace(
    request: UpdateNamespaceRequest,
  ): Promise<UpdateNamespaceResponse>;
  /**
   * DeprecateNamespace is used to update state of a registered namespace to DEPRECATED.  Once the namespace is deprecated
   * it cannot be used to start new workflow executions.  Existing workflow executions will continue to run on
   * deprecated namespaces.
   */
  DeprecateNamespace(
    request: DeprecateNamespaceRequest,
  ): Promise<DeprecateNamespaceResponse>;
  /**
   * StartWorkflowExecution starts a new long running workflow instance.  It will create the instance with
   * 'WorkflowExecutionStarted' event in history and also schedule the first WorkflowTask for the worker to make the
   * first command for this instance.  It will return 'WorkflowExecutionAlreadyStartedFailure', if an instance already
   * exists with same workflowId.
   */
  StartWorkflowExecution(
    request: StartWorkflowExecutionRequest,
  ): Promise<StartWorkflowExecutionResponse>;
  /**
   * GetWorkflowExecutionHistory returns the history of specified workflow execution.  It fails with 'NotFoundFailure' if specified workflow
   * execution in unknown to the service.
   */
  GetWorkflowExecutionHistory(
    request: GetWorkflowExecutionHistoryRequest,
  ): Promise<GetWorkflowExecutionHistoryResponse>;
  /**
   * PollWorkflowTaskQueue is called by application worker to process WorkflowTask from a specific task queue.  A
   * WorkflowTask is dispatched to callers for active workflow executions, with pending workflow tasks.
   * Application is then expected to call 'RespondWorkflowTaskCompleted' API when it is done processing the WorkflowTask.
   * It will also create a 'WorkflowTaskStarted' event in the history for that session before handing off WorkflowTask to
   * application worker.
   */
  PollWorkflowTaskQueue(
    request: PollWorkflowTaskQueueRequest,
  ): Promise<PollWorkflowTaskQueueResponse>;
  /**
   * RespondWorkflowTaskCompleted is called by application worker to complete a WorkflowTask handed as a result of
   * 'PollWorkflowTaskQueue' API call.  Completing a WorkflowTask will result in new events for the workflow execution and
   * potentially new ActivityTask being created for corresponding commands.  It will also create a WorkflowTaskCompleted
   * event in the history for that session.  Use the 'taskToken' provided as response of PollWorkflowTaskQueue API call
   * for completing the WorkflowTask.
   * The response could contain a new workflow task if there is one or if the request asking for one.
   */
  RespondWorkflowTaskCompleted(
    request: RespondWorkflowTaskCompletedRequest,
  ): Promise<RespondWorkflowTaskCompletedResponse>;
  /**
   * RespondWorkflowTaskFailed is called by application worker to indicate failure.  This results in
   * WorkflowTaskFailedEvent written to the history and a new WorkflowTask created.  This API can be used by client to
   * either clear sticky task queue or report any panics during WorkflowTask processing.  Temporal will only append first
   * WorkflowTaskFailed event to the history of workflow execution for consecutive failures.
   */
  RespondWorkflowTaskFailed(
    request: RespondWorkflowTaskFailedRequest,
  ): Promise<RespondWorkflowTaskFailedResponse>;
  /**
   * PollActivityTaskQueue is called by application worker to process ActivityTask from a specific task queue.  ActivityTask
   * is dispatched to callers whenever a ScheduleTask command is made for a workflow execution.
   * Application is expected to call 'RespondActivityTaskCompleted' or 'RespondActivityTaskFailed' once it is done
   * processing the task.
   * Application also needs to call 'RecordActivityTaskHeartbeat' API within 'heartbeatTimeoutSeconds' interval to
   * prevent the Task from getting timed out.  An in memory event 'ActivityTaskStarted' is also written to mutable state
   * before the ActivityTask is dispatched to application Worker. 'ActivityTaskStarted' and Activity finish event:
   * 'ActivityTaskCompleted' / 'ActivityTaskFailed' / 'ActivityTaskTimedout' will both be written to Workflow execution
   * history when Activity is finished.
   */
  PollActivityTaskQueue(
    request: PollActivityTaskQueueRequest,
  ): Promise<PollActivityTaskQueueResponse>;
  /**
   * RecordActivityTaskHeartbeat is called by application worker while it is processing an ActivityTask.  If worker fails
   * to heartbeat within 'heartbeatTimeoutSeconds' interval for the ActivityTask, then it will be marked as timedout and
   * 'ActivityTaskTimedOut' event will be written to the workflow history.  Calling 'RecordActivityTaskHeartbeat' will
   * fail with 'NotFoundFailure' in such situations.  Use the 'taskToken' provided as response of
   * PollActivityTaskQueue API call for heart beating.
   */
  RecordActivityTaskHeartbeat(
    request: RecordActivityTaskHeartbeatRequest,
  ): Promise<RecordActivityTaskHeartbeatResponse>;
  /**
   * (-- api-linter: core::0136::prepositions=disabled
   *     aip.dev/not-precedent: "By" is used to indicate request type. --)
   * RecordActivityTaskHeartbeatById is called by application worker while it is processing an ActivityTask.  If worker fails
   * to heartbeat within 'heartbeatTimeoutSeconds' interval for the ActivityTask, then it will be marked as timed out and
   * 'ActivityTaskTimedOut' event will be written to the workflow history.  Calling 'RecordActivityTaskHeartbeatById' will
   * fail with 'NotFoundFailure' in such situations.  Instead of using 'taskToken' like in RecordActivityTaskHeartbeat,
   * use Namespace, WorkflowId and ActivityId
   */
  RecordActivityTaskHeartbeatById(
    request: RecordActivityTaskHeartbeatByIdRequest,
  ): Promise<RecordActivityTaskHeartbeatByIdResponse>;
  /**
   * RespondActivityTaskCompleted is called by application worker when it is done processing an ActivityTask.  It will
   * result in a new 'ActivityTaskCompleted' event being written to the workflow history and a new WorkflowTask
   * created for the workflow so new commands could be made.  Use the 'taskToken' provided as response of
   * PollActivityTaskQueue API call for completion. It fails with 'NotFoundFailure' if the taskToken is not valid
   * anymore due to activity timeout.
   */
  RespondActivityTaskCompleted(
    request: RespondActivityTaskCompletedRequest,
  ): Promise<RespondActivityTaskCompletedResponse>;
  /**
   * (-- api-linter: core::0136::prepositions=disabled
   *     aip.dev/not-precedent: "By" is used to indicate request type. --)
   * RespondActivityTaskCompletedById is called by application worker when it is done processing an ActivityTask.
   * It will result in a new 'ActivityTaskCompleted' event being written to the workflow history and a new WorkflowTask
   * created for the workflow so new commands could be made.  Similar to RespondActivityTaskCompleted but use Namespace,
   * WorkflowId and ActivityId instead of 'taskToken' for completion. It fails with 'NotFoundFailure'
   * if the these Ids are not valid anymore due to activity timeout.
   */
  RespondActivityTaskCompletedById(
    request: RespondActivityTaskCompletedByIdRequest,
  ): Promise<RespondActivityTaskCompletedByIdResponse>;
  /**
   * RespondActivityTaskFailed is called by application worker when it is done processing an ActivityTask.  It will
   * result in a new 'ActivityTaskFailed' event being written to the workflow history and a new WorkflowTask
   * created for the workflow instance so new commands could be made.  Use the 'taskToken' provided as response of
   * PollActivityTaskQueue API call for completion. It fails with 'NotFoundFailure' if the taskToken is not valid
   * anymore due to activity timeout.
   */
  RespondActivityTaskFailed(
    request: RespondActivityTaskFailedRequest,
  ): Promise<RespondActivityTaskFailedResponse>;
  /**
   * (-- api-linter: core::0136::prepositions=disabled
   *     aip.dev/not-precedent: "By" is used to indicate request type. --)
   * RespondActivityTaskFailedById is called by application worker when it is done processing an ActivityTask.
   * It will result in a new 'ActivityTaskFailed' event being written to the workflow history and a new WorkflowTask
   * created for the workflow instance so new commands could be made.  Similar to RespondActivityTaskFailed but use
   * Namespace, WorkflowId and ActivityId instead of 'taskToken' for completion. It fails with 'NotFoundFailure'
   * if the these Ids are not valid anymore due to activity timeout.
   */
  RespondActivityTaskFailedById(
    request: RespondActivityTaskFailedByIdRequest,
  ): Promise<RespondActivityTaskFailedByIdResponse>;
  /**
   * RespondActivityTaskCanceled is called by application worker when it is successfully canceled an ActivityTask.  It will
   * result in a new 'ActivityTaskCanceled' event being written to the workflow history and a new WorkflowTask
   * created for the workflow instance so new commands could be made.  Use the 'taskToken' provided as response of
   * PollActivityTaskQueue API call for completion. It fails with 'NotFoundFailure' if the taskToken is not valid
   * anymore due to activity timeout.
   */
  RespondActivityTaskCanceled(
    request: RespondActivityTaskCanceledRequest,
  ): Promise<RespondActivityTaskCanceledResponse>;
  /**
   * (-- api-linter: core::0136::prepositions=disabled
   *     aip.dev/not-precedent: "By" is used to indicate request type. --)
   * RespondActivityTaskCanceledById is called by application worker when it is successfully canceled an ActivityTask.
   * It will result in a new 'ActivityTaskCanceled' event being written to the workflow history and a new WorkflowTask
   * created for the workflow instance so new commands could be made.  Similar to RespondActivityTaskCanceled but use
   * Namespace, WorkflowId and ActivityId instead of 'taskToken' for completion. It fails with 'NotFoundFailure'
   * if the these Ids are not valid anymore due to activity timeout.
   */
  RespondActivityTaskCanceledById(
    request: RespondActivityTaskCanceledByIdRequest,
  ): Promise<RespondActivityTaskCanceledByIdResponse>;
  /**
   * RequestCancelWorkflowExecution is called by application worker when it wants to request cancellation of a workflow instance.
   * It will result in a new 'WorkflowExecutionCancelRequested' event being written to the workflow history and a new WorkflowTask
   * created for the workflow instance so new commands could be made. It fails with 'NotFoundFailure' if the workflow is not valid
   * anymore due to completion or doesn't exist.
   */
  RequestCancelWorkflowExecution(
    request: RequestCancelWorkflowExecutionRequest,
  ): Promise<RequestCancelWorkflowExecutionResponse>;
  /**
   * SignalWorkflowExecution is used to send a signal event to running workflow execution.  This results in
   * WorkflowExecutionSignaled event recorded in the history and a workflow task being created for the execution.
   */
  SignalWorkflowExecution(
    request: SignalWorkflowExecutionRequest,
  ): Promise<SignalWorkflowExecutionResponse>;
  /**
   * (-- api-linter: core::0136::prepositions=disabled
   *     aip.dev/not-precedent: "With" is used to indicate combined operation. --)
   * SignalWithStartWorkflowExecution is used to ensure sending signal to a workflow.
   * If the workflow is running, this results in WorkflowExecutionSignaled event being recorded in the history
   * and a workflow task being created for the execution.
   * If the workflow is not running or not found, this results in WorkflowExecutionStarted and WorkflowExecutionSignaled
   * events being recorded in history, and a workflow task being created for the execution
   */
  SignalWithStartWorkflowExecution(
    request: SignalWithStartWorkflowExecutionRequest,
  ): Promise<SignalWithStartWorkflowExecutionResponse>;
  /**
   * ResetWorkflowExecution reset an existing workflow execution to WorkflowTaskCompleted event(exclusive).
   * And it will immediately terminating the current execution instance.
   */
  ResetWorkflowExecution(
    request: ResetWorkflowExecutionRequest,
  ): Promise<ResetWorkflowExecutionResponse>;
  /**
   * TerminateWorkflowExecution terminates an existing workflow execution by recording WorkflowExecutionTerminated event
   * in the history and immediately terminating the execution instance.
   */
  TerminateWorkflowExecution(
    request: TerminateWorkflowExecutionRequest,
  ): Promise<TerminateWorkflowExecutionResponse>;
  /** ListOpenWorkflowExecutions is a visibility API to list the open executions in a specific namespace. */
  ListOpenWorkflowExecutions(
    request: ListOpenWorkflowExecutionsRequest,
  ): Promise<ListOpenWorkflowExecutionsResponse>;
  /** ListClosedWorkflowExecutions is a visibility API to list the closed executions in a specific namespace. */
  ListClosedWorkflowExecutions(
    request: ListClosedWorkflowExecutionsRequest,
  ): Promise<ListClosedWorkflowExecutionsResponse>;
  /** ListWorkflowExecutions is a visibility API to list workflow executions in a specific namespace. */
  ListWorkflowExecutions(
    request: ListWorkflowExecutionsRequest,
  ): Promise<ListWorkflowExecutionsResponse>;
  /** ListArchivedWorkflowExecutions is a visibility API to list archived workflow executions in a specific namespace. */
  ListArchivedWorkflowExecutions(
    request: ListArchivedWorkflowExecutionsRequest,
  ): Promise<ListArchivedWorkflowExecutionsResponse>;
  /** ScanWorkflowExecutions is a visibility API to list large amount of workflow executions in a specific namespace without order. */
  ScanWorkflowExecutions(
    request: ScanWorkflowExecutionsRequest,
  ): Promise<ScanWorkflowExecutionsResponse>;
  /** CountWorkflowExecutions is a visibility API to count of workflow executions in a specific namespace. */
  CountWorkflowExecutions(
    request: CountWorkflowExecutionsRequest,
  ): Promise<CountWorkflowExecutionsResponse>;
  /** GetSearchAttributes is a visibility API to get all legal keys that could be used in list APIs */
  GetSearchAttributes(
    request: GetSearchAttributesRequest,
  ): Promise<GetSearchAttributesResponse>;
  /**
   * RespondQueryTaskCompleted is called by application worker to complete a QueryTask (which is a WorkflowTask for query)
   * as a result of 'PollWorkflowTaskQueue' API call. Completing a QueryTask will unblock the client call to 'QueryWorkflow'
   * API and return the query result to client as a response to 'QueryWorkflow' API call.
   */
  RespondQueryTaskCompleted(
    request: RespondQueryTaskCompletedRequest,
  ): Promise<RespondQueryTaskCompletedResponse>;
  /**
   * ResetStickyTaskQueue resets the sticky task queue related information in mutable state of a given workflow.
   * Things cleared are:
   * 1. StickyTaskQueue
   * 2. StickyScheduleToStartTimeout
   */
  ResetStickyTaskQueue(
    request: ResetStickyTaskQueueRequest,
  ): Promise<ResetStickyTaskQueueResponse>;
  /** QueryWorkflow returns query result for a specified workflow execution */
  QueryWorkflow(request: QueryWorkflowRequest): Promise<QueryWorkflowResponse>;
  /** DescribeWorkflowExecution returns information about the specified workflow execution. */
  DescribeWorkflowExecution(
    request: DescribeWorkflowExecutionRequest,
  ): Promise<DescribeWorkflowExecutionResponse>;
  /**
   * DescribeTaskQueue returns information about the target task queue, right now this API returns the
   * pollers which polled this task queue in last few minutes.
   */
  DescribeTaskQueue(
    request: DescribeTaskQueueRequest,
  ): Promise<DescribeTaskQueueResponse>;
  /** GetClusterInfo returns information about temporal cluster */
  GetClusterInfo(
    request: GetClusterInfoRequest,
  ): Promise<GetClusterInfoResponse>;
  ListTaskQueuePartitions(
    request: ListTaskQueuePartitionsRequest,
  ): Promise<ListTaskQueuePartitionsResponse>;
}

export class WorkflowServiceClientImpl implements WorkflowService {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.RegisterNamespace = this.RegisterNamespace.bind(this);
    this.DescribeNamespace = this.DescribeNamespace.bind(this);
    this.ListNamespaces = this.ListNamespaces.bind(this);
    this.UpdateNamespace = this.UpdateNamespace.bind(this);
    this.DeprecateNamespace = this.DeprecateNamespace.bind(this);
    this.StartWorkflowExecution = this.StartWorkflowExecution.bind(this);
    this.GetWorkflowExecutionHistory = this.GetWorkflowExecutionHistory.bind(
      this,
    );
    this.PollWorkflowTaskQueue = this.PollWorkflowTaskQueue.bind(this);
    this.RespondWorkflowTaskCompleted = this.RespondWorkflowTaskCompleted.bind(
      this,
    );
    this.RespondWorkflowTaskFailed = this.RespondWorkflowTaskFailed.bind(this);
    this.PollActivityTaskQueue = this.PollActivityTaskQueue.bind(this);
    this.RecordActivityTaskHeartbeat = this.RecordActivityTaskHeartbeat.bind(
      this,
    );
    this.RecordActivityTaskHeartbeatById = this.RecordActivityTaskHeartbeatById.bind(
      this,
    );
    this.RespondActivityTaskCompleted = this.RespondActivityTaskCompleted.bind(
      this,
    );
    this.RespondActivityTaskCompletedById = this.RespondActivityTaskCompletedById.bind(
      this,
    );
    this.RespondActivityTaskFailed = this.RespondActivityTaskFailed.bind(this);
    this.RespondActivityTaskFailedById = this.RespondActivityTaskFailedById.bind(
      this,
    );
    this.RespondActivityTaskCanceled = this.RespondActivityTaskCanceled.bind(
      this,
    );
    this.RespondActivityTaskCanceledById = this.RespondActivityTaskCanceledById.bind(
      this,
    );
    this.RequestCancelWorkflowExecution = this.RequestCancelWorkflowExecution.bind(
      this,
    );
    this.SignalWorkflowExecution = this.SignalWorkflowExecution.bind(this);
    this.SignalWithStartWorkflowExecution = this.SignalWithStartWorkflowExecution.bind(
      this,
    );
    this.ResetWorkflowExecution = this.ResetWorkflowExecution.bind(this);
    this.TerminateWorkflowExecution = this.TerminateWorkflowExecution.bind(
      this,
    );
    this.ListOpenWorkflowExecutions = this.ListOpenWorkflowExecutions.bind(
      this,
    );
    this.ListClosedWorkflowExecutions = this.ListClosedWorkflowExecutions.bind(
      this,
    );
    this.ListWorkflowExecutions = this.ListWorkflowExecutions.bind(this);
    this.ListArchivedWorkflowExecutions = this.ListArchivedWorkflowExecutions.bind(
      this,
    );
    this.ScanWorkflowExecutions = this.ScanWorkflowExecutions.bind(this);
    this.CountWorkflowExecutions = this.CountWorkflowExecutions.bind(this);
    this.GetSearchAttributes = this.GetSearchAttributes.bind(this);
    this.RespondQueryTaskCompleted = this.RespondQueryTaskCompleted.bind(this);
    this.ResetStickyTaskQueue = this.ResetStickyTaskQueue.bind(this);
    this.QueryWorkflow = this.QueryWorkflow.bind(this);
    this.DescribeWorkflowExecution = this.DescribeWorkflowExecution.bind(this);
    this.DescribeTaskQueue = this.DescribeTaskQueue.bind(this);
    this.GetClusterInfo = this.GetClusterInfo.bind(this);
    this.ListTaskQueuePartitions = this.ListTaskQueuePartitions.bind(this);
  }
  RegisterNamespace(
    request: RegisterNamespaceRequest,
  ): Promise<RegisterNamespaceResponse> {
    const data = RegisterNamespaceRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RegisterNamespace',
      data,
    );
    return promise.then((data) =>
      RegisterNamespaceResponse.decode(new _m0.Reader(data)),
    );
  }

  DescribeNamespace(
    request: DescribeNamespaceRequest,
  ): Promise<DescribeNamespaceResponse> {
    const data = DescribeNamespaceRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'DescribeNamespace',
      data,
    );
    return promise.then((data) =>
      DescribeNamespaceResponse.decode(new _m0.Reader(data)),
    );
  }

  ListNamespaces(
    request: ListNamespacesRequest,
  ): Promise<ListNamespacesResponse> {
    const data = ListNamespacesRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ListNamespaces',
      data,
    );
    return promise.then((data) =>
      ListNamespacesResponse.decode(new _m0.Reader(data)),
    );
  }

  UpdateNamespace(
    request: UpdateNamespaceRequest,
  ): Promise<UpdateNamespaceResponse> {
    const data = UpdateNamespaceRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'UpdateNamespace',
      data,
    );
    return promise.then((data) =>
      UpdateNamespaceResponse.decode(new _m0.Reader(data)),
    );
  }

  DeprecateNamespace(
    request: DeprecateNamespaceRequest,
  ): Promise<DeprecateNamespaceResponse> {
    const data = DeprecateNamespaceRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'DeprecateNamespace',
      data,
    );
    return promise.then((data) =>
      DeprecateNamespaceResponse.decode(new _m0.Reader(data)),
    );
  }

  StartWorkflowExecution(
    request: StartWorkflowExecutionRequest,
  ): Promise<StartWorkflowExecutionResponse> {
    const data = StartWorkflowExecutionRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'StartWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      StartWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  GetWorkflowExecutionHistory(
    request: GetWorkflowExecutionHistoryRequest,
  ): Promise<GetWorkflowExecutionHistoryResponse> {
    const data = GetWorkflowExecutionHistoryRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'GetWorkflowExecutionHistory',
      data,
    );
    return promise.then((data) =>
      GetWorkflowExecutionHistoryResponse.decode(new _m0.Reader(data)),
    );
  }

  PollWorkflowTaskQueue(
    request: PollWorkflowTaskQueueRequest,
  ): Promise<PollWorkflowTaskQueueResponse> {
    const data = PollWorkflowTaskQueueRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'PollWorkflowTaskQueue',
      data,
    );
    return promise.then((data) =>
      PollWorkflowTaskQueueResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondWorkflowTaskCompleted(
    request: RespondWorkflowTaskCompletedRequest,
  ): Promise<RespondWorkflowTaskCompletedResponse> {
    const data = RespondWorkflowTaskCompletedRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondWorkflowTaskCompleted',
      data,
    );
    return promise.then((data) =>
      RespondWorkflowTaskCompletedResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondWorkflowTaskFailed(
    request: RespondWorkflowTaskFailedRequest,
  ): Promise<RespondWorkflowTaskFailedResponse> {
    const data = RespondWorkflowTaskFailedRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondWorkflowTaskFailed',
      data,
    );
    return promise.then((data) =>
      RespondWorkflowTaskFailedResponse.decode(new _m0.Reader(data)),
    );
  }

  PollActivityTaskQueue(
    request: PollActivityTaskQueueRequest,
  ): Promise<PollActivityTaskQueueResponse> {
    const data = PollActivityTaskQueueRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'PollActivityTaskQueue',
      data,
    );
    return promise.then((data) =>
      PollActivityTaskQueueResponse.decode(new _m0.Reader(data)),
    );
  }

  RecordActivityTaskHeartbeat(
    request: RecordActivityTaskHeartbeatRequest,
  ): Promise<RecordActivityTaskHeartbeatResponse> {
    const data = RecordActivityTaskHeartbeatRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RecordActivityTaskHeartbeat',
      data,
    );
    return promise.then((data) =>
      RecordActivityTaskHeartbeatResponse.decode(new _m0.Reader(data)),
    );
  }

  RecordActivityTaskHeartbeatById(
    request: RecordActivityTaskHeartbeatByIdRequest,
  ): Promise<RecordActivityTaskHeartbeatByIdResponse> {
    const data = RecordActivityTaskHeartbeatByIdRequest.encode(
      request,
    ).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RecordActivityTaskHeartbeatById',
      data,
    );
    return promise.then((data) =>
      RecordActivityTaskHeartbeatByIdResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondActivityTaskCompleted(
    request: RespondActivityTaskCompletedRequest,
  ): Promise<RespondActivityTaskCompletedResponse> {
    const data = RespondActivityTaskCompletedRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondActivityTaskCompleted',
      data,
    );
    return promise.then((data) =>
      RespondActivityTaskCompletedResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondActivityTaskCompletedById(
    request: RespondActivityTaskCompletedByIdRequest,
  ): Promise<RespondActivityTaskCompletedByIdResponse> {
    const data = RespondActivityTaskCompletedByIdRequest.encode(
      request,
    ).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondActivityTaskCompletedById',
      data,
    );
    return promise.then((data) =>
      RespondActivityTaskCompletedByIdResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondActivityTaskFailed(
    request: RespondActivityTaskFailedRequest,
  ): Promise<RespondActivityTaskFailedResponse> {
    const data = RespondActivityTaskFailedRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondActivityTaskFailed',
      data,
    );
    return promise.then((data) =>
      RespondActivityTaskFailedResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondActivityTaskFailedById(
    request: RespondActivityTaskFailedByIdRequest,
  ): Promise<RespondActivityTaskFailedByIdResponse> {
    const data = RespondActivityTaskFailedByIdRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondActivityTaskFailedById',
      data,
    );
    return promise.then((data) =>
      RespondActivityTaskFailedByIdResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondActivityTaskCanceled(
    request: RespondActivityTaskCanceledRequest,
  ): Promise<RespondActivityTaskCanceledResponse> {
    const data = RespondActivityTaskCanceledRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondActivityTaskCanceled',
      data,
    );
    return promise.then((data) =>
      RespondActivityTaskCanceledResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondActivityTaskCanceledById(
    request: RespondActivityTaskCanceledByIdRequest,
  ): Promise<RespondActivityTaskCanceledByIdResponse> {
    const data = RespondActivityTaskCanceledByIdRequest.encode(
      request,
    ).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondActivityTaskCanceledById',
      data,
    );
    return promise.then((data) =>
      RespondActivityTaskCanceledByIdResponse.decode(new _m0.Reader(data)),
    );
  }

  RequestCancelWorkflowExecution(
    request: RequestCancelWorkflowExecutionRequest,
  ): Promise<RequestCancelWorkflowExecutionResponse> {
    const data = RequestCancelWorkflowExecutionRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RequestCancelWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      RequestCancelWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  SignalWorkflowExecution(
    request: SignalWorkflowExecutionRequest,
  ): Promise<SignalWorkflowExecutionResponse> {
    const data = SignalWorkflowExecutionRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'SignalWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      SignalWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  SignalWithStartWorkflowExecution(
    request: SignalWithStartWorkflowExecutionRequest,
  ): Promise<SignalWithStartWorkflowExecutionResponse> {
    const data = SignalWithStartWorkflowExecutionRequest.encode(
      request,
    ).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'SignalWithStartWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      SignalWithStartWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  ResetWorkflowExecution(
    request: ResetWorkflowExecutionRequest,
  ): Promise<ResetWorkflowExecutionResponse> {
    const data = ResetWorkflowExecutionRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ResetWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      ResetWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  TerminateWorkflowExecution(
    request: TerminateWorkflowExecutionRequest,
  ): Promise<TerminateWorkflowExecutionResponse> {
    const data = TerminateWorkflowExecutionRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'TerminateWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      TerminateWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  ListOpenWorkflowExecutions(
    request: ListOpenWorkflowExecutionsRequest,
  ): Promise<ListOpenWorkflowExecutionsResponse> {
    const data = ListOpenWorkflowExecutionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ListOpenWorkflowExecutions',
      data,
    );
    return promise.then((data) =>
      ListOpenWorkflowExecutionsResponse.decode(new _m0.Reader(data)),
    );
  }

  ListClosedWorkflowExecutions(
    request: ListClosedWorkflowExecutionsRequest,
  ): Promise<ListClosedWorkflowExecutionsResponse> {
    const data = ListClosedWorkflowExecutionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ListClosedWorkflowExecutions',
      data,
    );
    return promise.then((data) =>
      ListClosedWorkflowExecutionsResponse.decode(new _m0.Reader(data)),
    );
  }

  ListWorkflowExecutions(
    request: ListWorkflowExecutionsRequest,
  ): Promise<ListWorkflowExecutionsResponse> {
    const data = ListWorkflowExecutionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ListWorkflowExecutions',
      data,
    );
    return promise.then((data) =>
      ListWorkflowExecutionsResponse.decode(new _m0.Reader(data)),
    );
  }

  ListArchivedWorkflowExecutions(
    request: ListArchivedWorkflowExecutionsRequest,
  ): Promise<ListArchivedWorkflowExecutionsResponse> {
    const data = ListArchivedWorkflowExecutionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ListArchivedWorkflowExecutions',
      data,
    );
    return promise.then((data) =>
      ListArchivedWorkflowExecutionsResponse.decode(new _m0.Reader(data)),
    );
  }

  ScanWorkflowExecutions(
    request: ScanWorkflowExecutionsRequest,
  ): Promise<ScanWorkflowExecutionsResponse> {
    const data = ScanWorkflowExecutionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ScanWorkflowExecutions',
      data,
    );
    return promise.then((data) =>
      ScanWorkflowExecutionsResponse.decode(new _m0.Reader(data)),
    );
  }

  CountWorkflowExecutions(
    request: CountWorkflowExecutionsRequest,
  ): Promise<CountWorkflowExecutionsResponse> {
    const data = CountWorkflowExecutionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'CountWorkflowExecutions',
      data,
    );
    return promise.then((data) =>
      CountWorkflowExecutionsResponse.decode(new _m0.Reader(data)),
    );
  }

  GetSearchAttributes(
    request: GetSearchAttributesRequest,
  ): Promise<GetSearchAttributesResponse> {
    const data = GetSearchAttributesRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'GetSearchAttributes',
      data,
    );
    return promise.then((data) =>
      GetSearchAttributesResponse.decode(new _m0.Reader(data)),
    );
  }

  RespondQueryTaskCompleted(
    request: RespondQueryTaskCompletedRequest,
  ): Promise<RespondQueryTaskCompletedResponse> {
    const data = RespondQueryTaskCompletedRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'RespondQueryTaskCompleted',
      data,
    );
    return promise.then((data) =>
      RespondQueryTaskCompletedResponse.decode(new _m0.Reader(data)),
    );
  }

  ResetStickyTaskQueue(
    request: ResetStickyTaskQueueRequest,
  ): Promise<ResetStickyTaskQueueResponse> {
    const data = ResetStickyTaskQueueRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ResetStickyTaskQueue',
      data,
    );
    return promise.then((data) =>
      ResetStickyTaskQueueResponse.decode(new _m0.Reader(data)),
    );
  }

  QueryWorkflow(request: QueryWorkflowRequest): Promise<QueryWorkflowResponse> {
    const data = QueryWorkflowRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'QueryWorkflow',
      data,
    );
    return promise.then((data) =>
      QueryWorkflowResponse.decode(new _m0.Reader(data)),
    );
  }

  DescribeWorkflowExecution(
    request: DescribeWorkflowExecutionRequest,
  ): Promise<DescribeWorkflowExecutionResponse> {
    const data = DescribeWorkflowExecutionRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'DescribeWorkflowExecution',
      data,
    );
    return promise.then((data) =>
      DescribeWorkflowExecutionResponse.decode(new _m0.Reader(data)),
    );
  }

  DescribeTaskQueue(
    request: DescribeTaskQueueRequest,
  ): Promise<DescribeTaskQueueResponse> {
    const data = DescribeTaskQueueRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'DescribeTaskQueue',
      data,
    );
    return promise.then((data) =>
      DescribeTaskQueueResponse.decode(new _m0.Reader(data)),
    );
  }

  GetClusterInfo(
    request: GetClusterInfoRequest,
  ): Promise<GetClusterInfoResponse> {
    const data = GetClusterInfoRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'GetClusterInfo',
      data,
    );
    return promise.then((data) =>
      GetClusterInfoResponse.decode(new _m0.Reader(data)),
    );
  }

  ListTaskQueuePartitions(
    request: ListTaskQueuePartitionsRequest,
  ): Promise<ListTaskQueuePartitionsResponse> {
    const data = ListTaskQueuePartitionsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'temporal.api.workflowservice.v1.WorkflowService',
      'ListTaskQueuePartitions',
      data,
    );
    return promise.then((data) =>
      ListTaskQueuePartitionsResponse.decode(new _m0.Reader(data)),
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array,
  ): Promise<Uint8Array>;
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
