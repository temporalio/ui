export const enhancedStackTrace = {
  sdk: {
    name: 'typescript',
    version: '1.6.0',
  },
  stacks: [
    {
      locations: [
        {
          filePath:
            '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
          functionName: 'createExpense',
          line: 28,
          column: 8,
          awaitableId: 5,
        },
        {
          filePath:
            '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
          functionName: 'timeoutOrUserAction',
          line: 29,
          column: 8,
          awaitableId: 6,
        },
        {
          filePath:
            '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
          functionName: 'payment',
          line: 33,
          column: 8,
          awaitableId: 6,
        },
      ],
    },
  ],
  sources: {
    '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts':
      [
        {
          content:
            "import * as wf from '@temporalio/workflow';\nimport type * as activities from './activities';\n\nexport enum ExpenseStatus {\n  CREATED = 'CREATED',\n  APPROVED = 'APPROVED',\n  REJECTED = 'REJECTED',\n  TIMED_OUT = 'TIMED_OUT',\n  COMPLETED = 'COMPLETED',\n}\n\nexport const approveSignal = wf.defineSignal('approve');\nexport const rejectSignal = wf.defineSignal('reject');\n\nconst { createExpense, payment } = wf.proxyActivities<typeof activities>({\n  startToCloseTimeout: '5 minutes',\n});\n\nexport function timeoutOrUserAction(timeout: string): Promise<ExpenseStatus> {\n  return new Promise((resolve, reject) => {\n    wf.setHandler(approveSignal, () => resolve(ExpenseStatus.APPROVED));\n    wf.setHandler(rejectSignal, () => resolve(ExpenseStatus.REJECTED));\n    wf.sleep(timeout).then(() => resolve(ExpenseStatus.TIMED_OUT), reject);\n  });\n}\n\nexport async function expense(expenseId: string, timeout = '10s'): Promise<{ status: ExpenseStatus }> {\n  await createExpense(expenseId);\n  const status = await timeoutOrUserAction(timeout);\n  if (status !== ExpenseStatus.APPROVED) {\n    return { status };\n  }\n  await payment(expenseId);\n  return { status: ExpenseStatus.COMPLETED };\n}\n",
          lineOffset: 0,
        },
      ],
  },
};

// export const timeTravelEnhancedStackTrace = {
//   sdk: {
//     name: 'typescript',
//     version: '1.6.0',
//   },
//   stacks: {
//     1: [
//       {
//         locations: [
//           {
//             filePath:
//               '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
//             functionName: 'createExpense',
//             line: 28,
//             column: 8,
//             awaitableId: 5,
//           },
//         ],
//       },
//     ],
//     2: [
//       {
//         locations: [
//           {
//             filePath:
//               '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
//             functionName: 'createExpense',
//             line: 28,
//             column: 8,
//             awaitableId: 5,
//           },
//           {
//             filePath:
//               '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
//             functionName: 'timeoutOrUserAction',
//             line: 29,
//             column: 8,
//             awaitableId: 6,
//           },
//         ],
//       },
//     ],
//     3: [
//       {
//         locations: [
//           {
//             filePath:
//               '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
//             functionName: 'payment',
//             line: 33,
//             column: 8,
//             awaitableId: 6,
//           },
//         ],
//       },
//     ],
//   },
//   sources: {
//     '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts':
//       [
//         {
//           content:
//             "import * as wf from '@temporalio/workflow';\nimport type * as activities from './activities';\n\nexport enum ExpenseStatus {\n  CREATED = 'CREATED',\n  APPROVED = 'APPROVED',\n  REJECTED = 'REJECTED',\n  TIMED_OUT = 'TIMED_OUT',\n  COMPLETED = 'COMPLETED',\n}\n\nexport const approveSignal = wf.defineSignal('approve');\nexport const rejectSignal = wf.defineSignal('reject');\n\nconst { createExpense, payment } = wf.proxyActivities<typeof activities>({\n  startToCloseTimeout: '5 minutes',\n});\n\nexport function timeoutOrUserAction(timeout: string): Promise<ExpenseStatus> {\n  return new Promise((resolve, reject) => {\n    wf.setHandler(approveSignal, () => resolve(ExpenseStatus.APPROVED));\n    wf.setHandler(rejectSignal, () => resolve(ExpenseStatus.REJECTED));\n    wf.sleep(timeout).then(() => resolve(ExpenseStatus.TIMED_OUT), reject);\n  });\n}\n\nexport async function expense(expenseId: string, timeout = '10s'): Promise<{ status: ExpenseStatus }> {\n  await createExpense(expenseId);\n  const status = await timeoutOrUserAction(timeout);\n  if (status !== ExpenseStatus.APPROVED) {\n    return { status };\n  }\n  await payment(expenseId);\n  return { status: ExpenseStatus.COMPLETED };\n}\n",
//           lineOffset: 0,
//         },
//       ],
//   },
// };

export const timeTravelEnhancedStackTrace = {
  sdk: {
    name: 'typescript',
    version: '1.6.0',
  },
  sources: {
    '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts':
      [
        {
          content:
            "import { startChild, sleep, proxyActivities } from '@temporalio/workflow';\nimport { successString } from './success-string';\nimport type * as activities from '../activities';\n\nconst { sleepFor } = proxyActivities<typeof activities>({\n  startToCloseTimeout: '1 minute',\n});\n\nexport async function timeTravelStacks(): Promise<void> {\n  const child = await startChild(successString, {});\n\n  for (let i = 0; i < 5; i++) {\n    const sleepin = sleep(1);\n    const act = sleepFor(500);\n    await Promise.all([sleepin, act]);\n  }\n\n  await child.result();\n}\n\nexport async function enhancedStackStuck(): Promise<void> {\n  const child = await startChild(successString, {});\n\n  for (let i = 0; i < 5; i++) {\n    const sleepin = sleep(1);\n    const act = sleepFor(500);\n    await Promise.all([sleepin, act]);\n  }\n\n  await Promise.all([child.result(), sleep(1), sleep(100), sleepFor('1 day')]);\n}\n",
          lineOffset: 0,
        },
      ],
    '/mnt/chonky/dev/temporal/sdk-node/packages/workflow/src/workflow.ts': [
      {
        content:
          "import {\n  ActivityFunction,\n  ActivityOptions,\n  compileRetryPolicy,\n  IllegalStateError,\n  LocalActivityOptions,\n  mapToPayloads,\n  QueryDefinition,\n  searchAttributePayloadConverter,\n  SearchAttributes,\n  SignalDefinition,\n  toPayloads,\n  UntypedActivities,\n  WithWorkflowArgs,\n  Workflow,\n  WorkflowResultType,\n  WorkflowReturnType,\n} from '@temporalio/common';\nimport { msOptionalToTs, msToNumber, msToTs, tsToMs } from '@temporalio/common/lib/time';\nimport { composeInterceptors } from '@temporalio/common/lib/interceptors';\nimport { CancellationScope, registerSleepImplementation } from './cancellation-scope';\nimport {\n  ActivityInput,\n  LocalActivityInput,\n  SignalWorkflowInput,\n  StartChildWorkflowExecutionInput,\n  TimerInput,\n} from './interceptors';\nimport {\n  ChildWorkflowCancellationType,\n  ChildWorkflowOptions,\n  ChildWorkflowOptionsWithDefaults,\n  ContinueAsNew,\n  ContinueAsNewOptions,\n  DefaultSignalHandler,\n  EnhancedStackTrace,\n  Handler,\n  TimeTravelStackTrace,\n  WorkflowInfo,\n} from './interfaces';\nimport { LocalActivityDoBackoff, getActivator, maybeGetActivator } from './internals';\nimport { Sinks } from './sinks';\nimport { untrackPromise } from './stack-helpers';\nimport { ChildWorkflowHandle, ExternalWorkflowHandle } from './workflow-handle';\n\n// Avoid a circular dependency\nregisterSleepImplementation(sleep);\n\n/**\n * Adds default values to `workflowId` and `workflowIdReusePolicy` to given workflow options.\n */\nexport function addDefaultWorkflowOptions<T extends Workflow>(\n  opts: WithWorkflowArgs<T, ChildWorkflowOptions>\n): ChildWorkflowOptionsWithDefaults {\n  const { args, workflowId, ...rest } = opts;\n  return {\n    workflowId: workflowId ?? uuid4(),\n    args: args ?? [],\n    cancellationType: ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,\n    ...rest,\n  };\n}\n\n/**\n * Push a startTimer command into state accumulator and register completion\n */\nfunction timerNextHandler(input: TimerInput) {\n  const activator = getActivator();\n  const promise = new Promise<void>((resolve, reject) => {\n    const scope = CancellationScope.current();\n    if (scope.consideredCancelled) {\n      untrackPromise(scope.cancelRequested.catch(reject));\n      return;\n    }\n    if (scope.cancellable) {\n      untrackPromise(\n        scope.cancelRequested.catch((err) => {\n          if (!activator.completions.timer.delete(input.seq)) {\n            return; // Already resolved or never scheduled\n          }\n          activator.pushCommand({\n            cancelTimer: {\n              seq: input.seq,\n            },\n          });\n          reject(err);\n        })\n      );\n    }\n    activator.pushCommand({\n      startTimer: {\n        seq: input.seq,\n        startToFireTimeout: msToTs(input.durationMs),\n      },\n    });\n    activator.completions.timer.set(input.seq, {\n      resolve,\n      reject,\n    });\n  });\n  activator.promiseToCommand.set(promise, { type: 'StartTimer', seq: input.seq });\n  return promise;\n}\n\n/**\n * Asynchronous sleep.\n *\n * Schedules a timer on the Temporal service.\n *\n * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.\n * If given a negative number or 0, value will be set to 1.\n */\nexport function sleep(ms: number | string): Promise<void> {\n  const activator = getActivator();\n  const seq = activator.nextSeqs.timer++;\n\n  const durationMs = Math.max(1, msToNumber(ms));\n\n  const execute = composeInterceptors(activator.interceptors.outbound, 'startTimer', timerNextHandler);\n\n  return execute({\n    durationMs,\n    seq,\n  });\n}\n\nfunction validateActivityOptions(options: ActivityOptions): void {\n  if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {\n    throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');\n  }\n}\n\n// Use same validation we use for normal activities\nconst validateLocalActivityOptions = validateActivityOptions;\n\n/**\n * Hooks up activity promise to current cancellation scope and completion callbacks.\n *\n * Returns `false` if the current scope is already cancelled.\n */\n/**\n * Push a scheduleActivity command into activator accumulator and register completion\n */\nfunction scheduleActivityNextHandler({ options, args, headers, seq, activityType }: ActivityInput): Promise<unknown> {\n  const activator = getActivator();\n  validateActivityOptions(options);\n  const promise = new Promise((resolve, reject) => {\n    const scope = CancellationScope.current();\n    if (scope.consideredCancelled) {\n      untrackPromise(scope.cancelRequested.catch(reject));\n      return;\n    }\n    if (scope.cancellable) {\n      untrackPromise(\n        scope.cancelRequested.catch(() => {\n          if (!activator.completions.activity.has(seq)) {\n            return; // Already resolved or never scheduled\n          }\n          activator.pushCommand({\n            requestCancelActivity: {\n              seq,\n            },\n          });\n        })\n      );\n    }\n    activator.pushCommand({\n      scheduleActivity: {\n        seq,\n        activityId: options.activityId ?? `${seq}`,\n        activityType,\n        arguments: toPayloads(activator.payloadConverter, ...args),\n        retryPolicy: options.retry ? compileRetryPolicy(options.retry) : undefined,\n        taskQueue: options.taskQueue || activator.info?.taskQueue,\n        heartbeatTimeout: msOptionalToTs(options.heartbeatTimeout),\n        scheduleToCloseTimeout: msOptionalToTs(options.scheduleToCloseTimeout),\n        startToCloseTimeout: msOptionalToTs(options.startToCloseTimeout),\n        scheduleToStartTimeout: msOptionalToTs(options.scheduleToStartTimeout),\n        headers,\n        cancellationType: options.cancellationType,\n        doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),\n      },\n    });\n    activator.completions.activity.set(seq, {\n      resolve,\n      reject,\n    });\n  });\n  activator.promiseToCommand.set(promise, { type: 'ScheduleActivity', seq });\n  return promise;\n}\n\n/**\n * Push a scheduleActivity command into state accumulator and register completion\n */\nasync function scheduleLocalActivityNextHandler({\n  options,\n  args,\n  headers,\n  seq,\n  activityType,\n  attempt,\n  originalScheduleTime,\n}: LocalActivityInput): Promise<unknown> {\n  const activator = getActivator();\n  validateLocalActivityOptions(options);\n\n  return new Promise((resolve, reject) => {\n    const scope = CancellationScope.current();\n    if (scope.consideredCancelled) {\n      untrackPromise(scope.cancelRequested.catch(reject));\n      return;\n    }\n    if (scope.cancellable) {\n      untrackPromise(\n        scope.cancelRequested.catch(() => {\n          if (!activator.completions.activity.has(seq)) {\n            return; // Already resolved or never scheduled\n          }\n          activator.pushCommand({\n            requestCancelLocalActivity: {\n              seq,\n            },\n          });\n        })\n      );\n    }\n    activator.pushCommand({\n      scheduleLocalActivity: {\n        seq,\n        attempt,\n        originalScheduleTime,\n        // Intentionally not exposing activityId as an option\n        activityId: `${seq}`,\n        activityType,\n        arguments: toPayloads(activator.payloadConverter, ...args),\n        retryPolicy: options.retry ? compileRetryPolicy(options.retry) : undefined,\n        scheduleToCloseTimeout: msOptionalToTs(options.scheduleToCloseTimeout),\n        startToCloseTimeout: msOptionalToTs(options.startToCloseTimeout),\n        scheduleToStartTimeout: msOptionalToTs(options.scheduleToStartTimeout),\n        localRetryThreshold: msOptionalToTs(options.localRetryThreshold),\n        headers,\n        cancellationType: options.cancellationType,\n      },\n    });\n    activator.completions.activity.set(seq, {\n      resolve,\n      reject,\n    });\n  });\n}\n\n/**\n * Schedule an activity and run outbound interceptors\n * @hidden\n */\nexport function scheduleActivity<R>(activityType: string, args: any[], options: ActivityOptions): Promise<R> {\n  const activator = getActivator();\n  if (options === undefined) {\n    throw new TypeError('Got empty activity options');\n  }\n  const seq = activator.nextSeqs.activity++;\n  const execute = composeInterceptors(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);\n\n  return execute({\n    activityType,\n    headers: {},\n    options,\n    args,\n    seq,\n  }) as Promise<R>;\n}\n\n/**\n * Schedule an activity and run outbound interceptors\n * @hidden\n */\nexport async function scheduleLocalActivity<R>(\n  activityType: string,\n  args: any[],\n  options: LocalActivityOptions\n): Promise<R> {\n  const activator = getActivator();\n  if (options === undefined) {\n    throw new TypeError('Got empty activity options');\n  }\n\n  let attempt = 1;\n  let originalScheduleTime = undefined;\n\n  for (;;) {\n    const seq = activator.nextSeqs.activity++;\n    const execute = composeInterceptors(\n      activator.interceptors.outbound,\n      'scheduleLocalActivity',\n      scheduleLocalActivityNextHandler\n    );\n\n    try {\n      return (await execute({\n        activityType,\n        headers: {},\n        options,\n        args,\n        seq,\n        attempt,\n        originalScheduleTime,\n      })) as Promise<R>;\n    } catch (err) {\n      if (err instanceof LocalActivityDoBackoff) {\n        await sleep(tsToMs(err.backoff.backoffDuration));\n        if (typeof err.backoff.attempt !== 'number') {\n          throw new TypeError('Invalid backoff attempt type');\n        }\n        attempt = err.backoff.attempt;\n        originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;\n      } else {\n        throw err;\n      }\n    }\n  }\n}\n\nfunction startChildWorkflowExecutionNextHandler({\n  options,\n  headers,\n  workflowType,\n  seq,\n}: StartChildWorkflowExecutionInput): Promise<[Promise<string>, Promise<unknown>]> {\n  const activator = getActivator();\n  const workflowId = options.workflowId ?? uuid4();\n  const startPromise = new Promise<string>((resolve, reject) => {\n    const scope = CancellationScope.current();\n    if (scope.consideredCancelled) {\n      untrackPromise(scope.cancelRequested.catch(reject));\n      return;\n    }\n    if (scope.cancellable) {\n      untrackPromise(\n        scope.cancelRequested.catch(() => {\n          const complete = !activator.completions.childWorkflowComplete.has(seq);\n\n          if (!complete) {\n            activator.pushCommand({\n              cancelChildWorkflowExecution: { childWorkflowSeq: seq },\n            });\n          }\n          // Nothing to cancel otherwise\n        })\n      );\n    }\n    activator.pushCommand({\n      startChildWorkflowExecution: {\n        seq,\n        workflowId,\n        workflowType,\n        input: toPayloads(activator.payloadConverter, ...options.args),\n        retryPolicy: options.retry ? compileRetryPolicy(options.retry) : undefined,\n        taskQueue: options.taskQueue || activator.info?.taskQueue,\n        workflowExecutionTimeout: msOptionalToTs(options.workflowExecutionTimeout),\n        workflowRunTimeout: msOptionalToTs(options.workflowRunTimeout),\n        workflowTaskTimeout: msOptionalToTs(options.workflowTaskTimeout),\n        namespace: workflowInfo().namespace, // Not configurable\n        headers,\n        cancellationType: options.cancellationType,\n        workflowIdReusePolicy: options.workflowIdReusePolicy,\n        parentClosePolicy: options.parentClosePolicy,\n        cronSchedule: options.cronSchedule,\n        searchAttributes: options.searchAttributes\n          ? mapToPayloads(searchAttributePayloadConverter, options.searchAttributes)\n          : undefined,\n        memo: options.memo && mapToPayloads(activator.payloadConverter, options.memo),\n      },\n    });\n    activator.completions.childWorkflowStart.set(seq, {\n      resolve,\n      reject,\n    });\n  });\n\n  // We construct a Promise for the completion of the child Workflow before we know\n  // if the Workflow code will await it to capture the result in case it does.\n  const completePromise = new Promise((resolve, reject) => {\n    // Chain start Promise rejection to the complete Promise.\n    untrackPromise(startPromise.catch(reject));\n    activator.completions.childWorkflowComplete.set(seq, {\n      resolve,\n      reject,\n    });\n  });\n  untrackPromise(startPromise);\n  untrackPromise(completePromise);\n  // Prevent unhandled rejection because the completion might not be awaited\n  untrackPromise(completePromise.catch(() => undefined));\n  const ret = new Promise<[Promise<string>, Promise<unknown>]>((resolve) => resolve([startPromise, completePromise]));\n  untrackPromise(ret);\n  return ret;\n}\n\nfunction signalWorkflowNextHandler({ seq, signalName, args, target, headers }: SignalWorkflowInput) {\n  const activator = getActivator();\n  return new Promise<any>((resolve, reject) => {\n    const scope = CancellationScope.current();\n    if (scope.consideredCancelled) {\n      untrackPromise(scope.cancelRequested.catch(reject));\n      return;\n    }\n\n    if (scope.cancellable) {\n      untrackPromise(\n        scope.cancelRequested.catch(() => {\n          if (!activator.completions.signalWorkflow.has(seq)) {\n            return;\n          }\n          activator.pushCommand({ cancelSignalWorkflow: { seq } });\n        })\n      );\n    }\n    activator.pushCommand({\n      signalExternalWorkflowExecution: {\n        seq,\n        args: toPayloads(activator.payloadConverter, ...args),\n        headers,\n        signalName,\n        ...(target.type === 'external'\n          ? {\n              workflowExecution: {\n                namespace: activator.info.namespace,\n                ...target.workflowExecution,\n              },\n            }\n          : {\n              childWorkflowId: target.childWorkflowId,\n            }),\n      },\n    });\n\n    activator.completions.signalWorkflow.set(seq, { resolve, reject });\n  });\n}\n\n/**\n * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.\n *\n * @see {@link ActivityInterfaceFor}\n * @see {@link proxyActivities}\n * @see {@link proxyLocalActivities}\n */\nexport const NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');\n\n/**\n * Type helper that takes a type `T` and transforms attributes that are not {@link ActivityFunction} to\n * {@link NotAnActivityMethod}.\n *\n * @example\n *\n * Used by {@link proxyActivities} to get this compile-time error:\n *\n * ```ts\n * interface MyActivities {\n *   valid(input: number): Promise<number>;\n *   invalid(input: number): number;\n * }\n *\n * const act = proxyActivities<MyActivities>({ startToCloseTimeout: '5m' });\n *\n * await act.valid(true);\n * await act.invalid();\n * // ^ TS complains with:\n * // (property) invalidDefinition: typeof NotAnActivityMethod\n * // This expression is not callable.\n * // Type 'Symbol' has no call signatures.(2349)\n * ```\n */\nexport type ActivityInterfaceFor<T> = {\n  [K in keyof T]: T[K] extends ActivityFunction ? T[K] : typeof NotAnActivityMethod;\n};\n\n/**\n * Configure Activity functions with given {@link ActivityOptions}.\n *\n * This method may be called multiple times to setup Activities with different options.\n *\n * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for\n *         which each attribute is a callable Activity function\n *\n * @example\n * ```ts\n * import { proxyActivities } from '@temporalio/workflow';\n * import * as activities from '../activities';\n *\n * // Setup Activities from module exports\n * const { httpGet, otherActivity } = proxyActivities<typeof activities>({\n *   startToCloseTimeout: '30 minutes',\n * });\n *\n * // Setup Activities from an explicit interface (e.g. when defined by another SDK)\n * interface JavaActivities {\n *   httpGetFromJava(url: string): Promise<string>\n *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;\n * }\n *\n * const {\n *   httpGetFromJava,\n *   someOtherJavaActivity\n * } = proxyActivities<JavaActivities>({\n *   taskQueue: 'java-worker-taskQueue',\n *   startToCloseTimeout: '5m',\n * });\n *\n * export function execute(): Promise<void> {\n *   const response = await httpGet('http://example.com');\n *   // ...\n * }\n * ```\n */\nexport function proxyActivities<A = UntypedActivities>(options: ActivityOptions): ActivityInterfaceFor<A> {\n  if (options === undefined) {\n    throw new TypeError('options must be defined');\n  }\n  // Validate as early as possible for immediate user feedback\n  validateActivityOptions(options);\n  return new Proxy(\n    {},\n    {\n      get(_, activityType) {\n        if (typeof activityType !== 'string') {\n          throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);\n        }\n        return function activityProxyFunction(...args: unknown[]): Promise<unknown> {\n          return scheduleActivity(activityType, args, options);\n        };\n      },\n    }\n  ) as any;\n}\n\n/**\n * Configure Local Activity functions with given {@link LocalActivityOptions}.\n *\n * This method may be called multiple times to setup Activities with different options.\n *\n * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}\n *         for which each attribute is a callable Activity function\n *\n * @experimental\n *\n * @see {@link proxyActivities} for examples\n */\nexport function proxyLocalActivities<A = UntypedActivities>(options: LocalActivityOptions): ActivityInterfaceFor<A> {\n  if (options === undefined) {\n    throw new TypeError('options must be defined');\n  }\n  // Validate as early as possible for immediate user feedback\n  validateLocalActivityOptions(options);\n  return new Proxy(\n    {},\n    {\n      get(_, activityType) {\n        if (typeof activityType !== 'string') {\n          throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);\n        }\n        return function localActivityProxyFunction(...args: unknown[]) {\n          return scheduleLocalActivity(activityType, args, options);\n        };\n      },\n    }\n  ) as any;\n}\n\n// TODO: deprecate this patch after \"enough\" time has passed\nconst EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';\n\n/**\n * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.\n * It takes a Workflow ID and optional run ID.\n */\nexport function getExternalWorkflowHandle(workflowId: string, runId?: string): ExternalWorkflowHandle {\n  const activator = getActivator();\n  return {\n    workflowId,\n    runId,\n    cancel() {\n      return new Promise<void>((resolve, reject) => {\n        // Connect this cancel operation to the current cancellation scope.\n        // This is behavior was introduced after v0.22.0 and is incompatible\n        // with histories generated with previous SDK versions and thus requires\n        // patching.\n        //\n        // We try to delay patching as much as possible to avoid polluting\n        // histories unless strictly required.\n        const scope = CancellationScope.current();\n        if (scope.cancellable) {\n          untrackPromise(\n            scope.cancelRequested.catch((err) => {\n              if (patched(EXTERNAL_WF_CANCEL_PATCH)) {\n                reject(err);\n              }\n            })\n          );\n        }\n        if (scope.consideredCancelled) {\n          if (patched(EXTERNAL_WF_CANCEL_PATCH)) {\n            return;\n          }\n        }\n\n        const seq = activator.nextSeqs.cancelWorkflow++;\n        activator.pushCommand({\n          requestCancelExternalWorkflowExecution: {\n            seq,\n            workflowExecution: {\n              namespace: activator.info.namespace,\n              workflowId,\n              runId,\n            },\n          },\n        });\n        activator.completions.cancelWorkflow.set(seq, { resolve, reject });\n      });\n    },\n    signal<Args extends any[]>(def: SignalDefinition<Args> | string, ...args: Args): Promise<void> {\n      return composeInterceptors(\n        activator.interceptors.outbound,\n        'signalWorkflow',\n        signalWorkflowNextHandler\n      )({\n        seq: activator.nextSeqs.signalWorkflow++,\n        signalName: typeof def === 'string' ? def : def.name,\n        args,\n        target: {\n          type: 'external',\n          workflowExecution: { workflowId, runId },\n        },\n        headers: {},\n      });\n    },\n  };\n}\n\n/**\n * Start a child Workflow execution\n *\n * - Returns a client-side handle that implements a child Workflow interface.\n * - By default, a child will be scheduled on the same task queue as its parent.\n *\n * A child Workflow handle supports awaiting completion, signaling and cancellation via {@link CancellationScope}s.\n * In order to query the child, use a {@link WorkflowClient} from an Activity.\n */\nexport async function startChild<T extends Workflow>(\n  workflowType: string,\n  options: WithWorkflowArgs<T, ChildWorkflowOptions>\n): Promise<ChildWorkflowHandle<T>>;\n\n/**\n * Start a child Workflow execution\n *\n * - Returns a client-side handle that implements a child Workflow interface.\n * - Deduces the Workflow type and signature from provided Workflow function.\n * - By default, a child will be scheduled on the same task queue as its parent.\n *\n * A child Workflow handle supports awaiting completion, signaling and cancellation via {@link CancellationScope}s.\n * In order to query the child, use a {@link WorkflowClient} from an Activity.\n */\nexport async function startChild<T extends Workflow>(\n  workflowFunc: T,\n  options: WithWorkflowArgs<T, ChildWorkflowOptions>\n): Promise<ChildWorkflowHandle<T>>;\n\n/**\n * Start a child Workflow execution\n *\n * **Override for Workflows that accept no arguments**.\n *\n * - Returns a client-side handle that implements a child Workflow interface.\n * - The child will be scheduled on the same task queue as its parent.\n *\n * A child Workflow handle supports awaiting completion, signaling and cancellation via {@link CancellationScope}s.\n * In order to query the child, use a {@link WorkflowClient} from an Activity.\n */\nexport async function startChild<T extends () => Promise<any>>(workflowType: string): Promise<ChildWorkflowHandle<T>>;\n\n/**\n * Start a child Workflow execution\n *\n * **Override for Workflows that accept no arguments**.\n *\n * - Returns a client-side handle that implements a child Workflow interface.\n * - Deduces the Workflow type and signature from provided Workflow function.\n * - The child will be scheduled on the same task queue as its parent.\n *\n * A child Workflow handle supports awaiting completion, signaling and cancellation via {@link CancellationScope}s.\n * In order to query the child, use a {@link WorkflowClient} from an Activity.\n */\nexport async function startChild<T extends () => Promise<any>>(workflowFunc: T): Promise<ChildWorkflowHandle<T>>;\n\nexport async function startChild<T extends Workflow>(\n  workflowTypeOrFunc: string | T,\n  options?: WithWorkflowArgs<T, ChildWorkflowOptions>\n): Promise<ChildWorkflowHandle<T>> {\n  const activator = getActivator();\n  const optionsWithDefaults = addDefaultWorkflowOptions(options ?? ({} as any));\n  const workflowType = typeof workflowTypeOrFunc === 'string' ? workflowTypeOrFunc : workflowTypeOrFunc.name;\n  const execute = composeInterceptors(\n    activator.interceptors.outbound,\n    'startChildWorkflowExecution',\n    startChildWorkflowExecutionNextHandler\n  );\n  const [started, completed] = await execute({\n    seq: activator.nextSeqs.childWorkflow++,\n    options: optionsWithDefaults,\n    headers: {},\n    workflowType,\n  });\n  const firstExecutionRunId = await started;\n\n  return {\n    workflowId: optionsWithDefaults.workflowId,\n    firstExecutionRunId,\n    async result(): Promise<WorkflowResultType<T>> {\n      return (await completed) as any;\n    },\n    async signal<Args extends any[]>(def: SignalDefinition<Args> | string, ...args: Args): Promise<void> {\n      return composeInterceptors(\n        activator.interceptors.outbound,\n        'signalWorkflow',\n        signalWorkflowNextHandler\n      )({\n        seq: activator.nextSeqs.signalWorkflow++,\n        signalName: typeof def === 'string' ? def : def.name,\n        args,\n        target: {\n          type: 'child',\n          childWorkflowId: optionsWithDefaults.workflowId,\n        },\n        headers: {},\n      });\n    },\n  };\n}\n\n/**\n * Start a child Workflow execution and await its completion.\n *\n * - By default, a child will be scheduled on the same task queue as its parent.\n * - This operation is cancellable using {@link CancellationScope}s.\n *\n * @return The result of the child Workflow.\n */\nexport async function executeChild<T extends Workflow>(\n  workflowType: string,\n  options: WithWorkflowArgs<T, ChildWorkflowOptions>\n): Promise<WorkflowResultType<T>>;\n\n/**\n * Start a child Workflow execution and await its completion.\n *\n * - By default, a child will be scheduled on the same task queue as its parent.\n * - Deduces the Workflow type and signature from provided Workflow function.\n * - This operation is cancellable using {@link CancellationScope}s.\n *\n * @return The result of the child Workflow.\n */\nexport async function executeChild<T extends Workflow>(\n  workflowType: T,\n  options: WithWorkflowArgs<T, ChildWorkflowOptions>\n): Promise<WorkflowResultType<T>>;\n\n/**\n * Start a child Workflow execution and await its completion.\n *\n * **Override for Workflows that accept no arguments**.\n *\n * - The child will be scheduled on the same task queue as its parent.\n * - This operation is cancellable using {@link CancellationScope}s.\n *\n * @return The result of the child Workflow.\n */\nexport async function executeChild<T extends () => WorkflowReturnType>(\n  workflowType: string\n): Promise<WorkflowResultType<T>>;\n\n/**\n * Start a child Workflow execution and await its completion.\n *\n * **Override for Workflows that accept no arguments**.\n *\n * - The child will be scheduled on the same task queue as its parent.\n * - Deduces the Workflow type and signature from provided Workflow function.\n * - This operation is cancellable using {@link CancellationScope}s.\n *\n * @return The result of the child Workflow.\n */\nexport async function executeChild<T extends () => WorkflowReturnType>(workflowFunc: T): Promise<WorkflowResultType<T>>;\n\nexport async function executeChild<T extends Workflow>(\n  workflowTypeOrFunc: string | T,\n  options?: WithWorkflowArgs<T, ChildWorkflowOptions>\n): Promise<WorkflowResultType<T>> {\n  const activator = getActivator();\n  const optionsWithDefaults = addDefaultWorkflowOptions(options ?? ({} as any));\n  const workflowType = typeof workflowTypeOrFunc === 'string' ? workflowTypeOrFunc : workflowTypeOrFunc.name;\n  const execute = composeInterceptors(\n    activator.interceptors.outbound,\n    'startChildWorkflowExecution',\n    startChildWorkflowExecutionNextHandler\n  );\n  const execPromise = execute({\n    seq: activator.nextSeqs.childWorkflow++,\n    options: optionsWithDefaults,\n    headers: {},\n    workflowType,\n  });\n  untrackPromise(execPromise);\n  const completedPromise = execPromise.then(([_started, completed]) => completed);\n  untrackPromise(completedPromise);\n  return completedPromise as Promise<any>;\n}\n\n/**\n * Get information about the current Workflow.\n *\n * ⚠️ We recommend calling `workflowInfo()` whenever accessing {@link WorkflowInfo} fields. Some WorkflowInfo fields\n * change during the lifetime of an Execution—like {@link WorkflowInfo.historyLength} and\n * {@link WorkflowInfo.searchAttributes}—and some may be changeable in the future—like {@link WorkflowInfo.taskQueue}.\n *\n * ```ts\n * // GOOD\n * function myWorkflow() {\n *   doSomething(workflowInfo().searchAttributes)\n *   ...\n *   doSomethingElse(workflowInfo().searchAttributes)\n * }\n * ```\n *\n * ```ts\n * // BAD\n * function myWorkflow() {\n *   const attributes = workflowInfo().searchAttributes\n *   doSomething(attributes)\n *   ...\n *   doSomethingElse(attributes)\n * }\n */\nexport function workflowInfo(): WorkflowInfo {\n  return getActivator().info;\n}\n\n/**\n * Returns whether or not code is executing in workflow context\n */\nexport function inWorkflowContext(): boolean {\n  return maybeGetActivator() !== undefined;\n}\n\n/**\n * Get a reference to Sinks for exporting data out of the Workflow.\n *\n * These Sinks **must** be registered with the Worker in order for this\n * mechanism to work.\n *\n * @example\n * ```ts\n * import { proxySinks, Sinks } from '@temporalio/workflow';\n *\n * interface MySinks extends Sinks {\n *   logger: {\n *     info(message: string): void;\n *     error(message: string): void;\n *   };\n * }\n *\n * const { logger } = proxySinks<MyDependencies>();\n * logger.info('setting up');\n *\n * export function myWorkflow() {\n *   return {\n *     async execute() {\n *       logger.info('hey ho');\n *       logger.error('lets go');\n *     }\n *   };\n * }\n * ```\n */\nexport function proxySinks<T extends Sinks>(): T {\n  return new Proxy(\n    {},\n    {\n      get(_, ifaceName) {\n        return new Proxy(\n          {},\n          {\n            get(_, fnName) {\n              return (...args: any[]) => {\n                const activator = getActivator();\n                activator.sinkCalls.push({\n                  ifaceName: ifaceName as string,\n                  fnName: fnName as string,\n                  args,\n                });\n              };\n            },\n          }\n        );\n      },\n    }\n  ) as any;\n}\n\n/**\n * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.\n *\n * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.\n *\n * Once `f` is called, Workflow Execution immediately completes.\n */\nexport function makeContinueAsNewFunc<F extends Workflow>(\n  options?: ContinueAsNewOptions\n): (...args: Parameters<F>) => Promise<never> {\n  const activator = getActivator();\n  const info = workflowInfo();\n  const { workflowType, taskQueue, ...rest } = options ?? {};\n  const requiredOptions = {\n    workflowType: workflowType ?? info.workflowType,\n    taskQueue: taskQueue ?? info.taskQueue,\n    ...rest,\n  };\n\n  return (...args: Parameters<F>): Promise<never> => {\n    const fn = composeInterceptors(activator.interceptors.outbound, 'continueAsNew', async (input) => {\n      const { headers, args, options } = input;\n      throw new ContinueAsNew({\n        workflowType: options.workflowType,\n        arguments: toPayloads(activator.payloadConverter, ...args),\n        headers,\n        taskQueue: options.taskQueue,\n        memo: options.memo && mapToPayloads(activator.payloadConverter, options.memo),\n        searchAttributes: options.searchAttributes\n          ? mapToPayloads(searchAttributePayloadConverter, options.searchAttributes)\n          : undefined,\n        workflowRunTimeout: msOptionalToTs(options.workflowRunTimeout),\n        workflowTaskTimeout: msOptionalToTs(options.workflowTaskTimeout),\n      });\n    });\n    return fn({\n      args,\n      headers: {},\n      options: requiredOptions,\n    });\n  };\n}\n\n/**\n * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution\n * with default options.\n *\n * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)\n *\n * @example\n *\n *```ts\n *import { continueAsNew } from '@temporalio/workflow';\n *\n *export async function myWorkflow(n: number): Promise<void> {\n *  // ... Workflow logic\n *  await continueAsNew<typeof myWorkflow>(n + 1);\n *}\n *```\n */\nexport function continueAsNew<F extends Workflow>(...args: Parameters<F>): Promise<never> {\n  return makeContinueAsNewFunc()(...args);\n}\n\n/**\n * Generate an RFC compliant V4 uuid.\n * Uses the workflow's deterministic PRNG making it safe for use within a workflow.\n * This function is cryptographically insecure.\n * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.\n */\nexport function uuid4(): string {\n  // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`\n  const ho = (n: number, p: number) => n.toString(16).padStart(p, '0');\n  // Create a view backed by a 16-byte buffer\n  const view = new DataView(new ArrayBuffer(16));\n  // Fill buffer with random values\n  view.setUint32(0, (Math.random() * 0x100000000) >>> 0);\n  view.setUint32(4, (Math.random() * 0x100000000) >>> 0);\n  view.setUint32(8, (Math.random() * 0x100000000) >>> 0);\n  view.setUint32(12, (Math.random() * 0x100000000) >>> 0);\n  // Patch the 6th byte to reflect a version 4 UUID\n  view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);\n  // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)\n  view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);\n  // Compile the canonical textual form from the array data\n  return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(\n    view.getUint16(8),\n    4\n  )}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;\n}\n\n/**\n * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.\n *\n * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.\n *\n * If the workflow is replaying an existing history, then this function returns true if that\n * history was produced by a worker which also had a `patched` call with the same `patchId`.\n * If the history was produced by a worker *without* such a call, then it will return false.\n *\n * If the workflow is not currently replaying, then this call *always* returns true.\n *\n * Your workflow code should run the \"new\" code if this returns true, if it returns false, you\n * should run the \"old\" code. By doing this, you can maintain determinism.\n *\n * @param patchId An identifier that should be unique to this patch. It is OK to use multiple\n * calls with the same ID, which means all such calls will always return the same value.\n */\nexport function patched(patchId: string): boolean {\n  return patchInternal(patchId, false);\n}\n\n/**\n * Indicate that a patch is being phased out.\n *\n * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.\n *\n * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but\n * they must *not* be deployed while any workers still exist running old code without a\n * {@link patched} call, or any runs with histories produced by such workers exist. If either kind\n * of worker encounters a history produced by the other, their behavior is undefined.\n *\n * Once all live workflow runs have been produced by workers with this call, you can deploy workers\n * which are free of either kind of patch call for this ID. Workers with and without this call\n * may coexist, as long as they are both running the \"new\" code.\n *\n * @param patchId An identifier that should be unique to this patch. It is OK to use multiple\n * calls with the same ID, which means all such calls will always return the same value.\n */\nexport function deprecatePatch(patchId: string): void {\n  patchInternal(patchId, true);\n}\n\nfunction patchInternal(patchId: string, deprecated: boolean): boolean {\n  const activator = getActivator();\n  // Patch operation does not support interception at the moment, if it did,\n  // this would be the place to start the interception chain\n\n  if (activator.workflow === undefined) {\n    throw new IllegalStateError('Patches cannot be used before Workflow starts');\n  }\n  const usePatch = !activator.info.unsafe.isReplaying || activator.knownPresentPatches.has(patchId);\n  // Avoid sending commands for patches core already knows about.\n  // This optimization enables development of automatic patching tools.\n  if (usePatch && !activator.sentPatches.has(patchId)) {\n    activator.pushCommand({\n      setPatchMarker: { patchId, deprecated },\n    });\n    activator.sentPatches.add(patchId);\n  }\n  return usePatch;\n}\n\n/**\n * Returns a Promise that resolves when `fn` evaluates to `true` or `timeout` expires.\n *\n * @param timeout number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}\n *\n * @returns a boolean indicating whether the condition was true before the timeout expires\n */\nexport function condition(fn: () => boolean, timeout: number | string): Promise<boolean>;\n\n/**\n * Returns a Promise that resolves when `fn` evaluates to `true`.\n */\nexport function condition(fn: () => boolean): Promise<void>;\n\nexport async function condition(fn: () => boolean, timeout?: number | string): Promise<void | boolean> {\n  // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`\n  if (timeout === 0 && !getActivator().checkInternalPatchAtLeast(1)) {\n    return conditionInner(fn);\n  }\n  if (typeof timeout === 'number' || typeof timeout === 'string') {\n    return CancellationScope.cancellable(async () => {\n      try {\n        return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);\n      } finally {\n        CancellationScope.current().cancel();\n      }\n    });\n  }\n  return conditionInner(fn);\n}\n\nfunction conditionInner(fn: () => boolean): Promise<void> {\n  const activator = getActivator();\n  return new Promise((resolve, reject) => {\n    const scope = CancellationScope.current();\n    if (scope.consideredCancelled) {\n      untrackPromise(scope.cancelRequested.catch(reject));\n      return;\n    }\n\n    const seq = activator.nextSeqs.condition++;\n    if (scope.cancellable) {\n      untrackPromise(\n        scope.cancelRequested.catch((err) => {\n          activator.blockedConditions.delete(seq);\n          reject(err);\n        })\n      );\n    }\n\n    // Eager evaluation\n    if (fn()) {\n      resolve();\n      return;\n    }\n\n    activator.blockedConditions.set(seq, { fn, resolve });\n  });\n}\n\n/**\n * Define a signal method for a Workflow.\n *\n * Definitions are used to register handler in the Workflow via {@link setHandler} and to signal Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.\n * Definitions can be reused in multiple Workflows.\n */\nexport function defineSignal<Args extends any[] = [], Name extends string = string>(\n  name: Name\n): SignalDefinition<Args, Name> {\n  return {\n    type: 'signal',\n    name,\n  } as SignalDefinition<Args, Name>;\n}\n\n/**\n * Define a query method for a Workflow.\n *\n * Definitions are used to register handler in the Workflow via {@link setHandler} and to query Workflows using a {@link WorkflowHandle}.\n * Definitions can be reused in multiple Workflows.\n */\nexport function defineQuery<Ret, Args extends any[] = [], Name extends string = string>(\n  name: Name\n): QueryDefinition<Ret, Args, Name> {\n  return {\n    type: 'query',\n    name,\n  } as QueryDefinition<Ret, Args, Name>;\n}\n\n/**\n * Set a handler function for a Workflow query or signal.\n *\n * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.\n *\n * @param def a {@link SignalDefinition} or {@link QueryDefinition} as returned by {@link defineSignal} or {@link defineQuery} respectively.\n * @param handler a compatible handler function for the given definition or `undefined` to unset the handler.\n */\nexport function setHandler<Ret, Args extends any[], T extends SignalDefinition<Args> | QueryDefinition<Ret, Args>>(\n  def: T,\n  handler: Handler<Ret, Args, T> | undefined\n): void {\n  const activator = getActivator();\n  if (def.type === 'signal') {\n    if (typeof handler === 'function') {\n      activator.signalHandlers.set(def.name, handler as any);\n      activator.dispatchBufferedSignals();\n    } else if (handler == null) {\n      activator.signalHandlers.delete(def.name);\n    } else {\n      throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);\n    }\n  } else if (def.type === 'query') {\n    if (typeof handler === 'function') {\n      activator.queryHandlers.set(def.name, handler as any);\n    } else if (handler == null) {\n      activator.queryHandlers.delete(def.name);\n    } else {\n      throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);\n    }\n  } else {\n    throw new TypeError(`Invalid definition type: ${(def as any).type}`);\n  }\n}\n\n/**\n * Set a signal handler function that will handle signals calls for non-registered signal names.\n *\n * Signals are dispatched to the default signal handler in the order that they were accepted by the server.\n *\n * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.\n *\n * @param handler a function that will handle signals for non-registered signal names, or `undefined` to unset the handler.\n */\nexport function setDefaultSignalHandler(handler: DefaultSignalHandler | undefined): void {\n  const activator = getActivator();\n  if (typeof handler === 'function') {\n    activator.defaultSignalHandler = handler;\n    activator.dispatchBufferedSignals();\n  } else if (handler == null) {\n    activator.defaultSignalHandler = undefined;\n  } else {\n    throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);\n  }\n}\n\n/**\n * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search\n * Attributes, `workflowInfo().searchAttributes`.\n *\n * For example, this Workflow code:\n *\n * ```ts\n * upsertSearchAttributes({\n *   CustomIntField: [1, 2, 3],\n *   CustomBoolField: [true]\n * });\n * upsertSearchAttributes({\n *   CustomIntField: [42],\n *   CustomKeywordField: ['durable code', 'is great']\n * });\n * ```\n *\n * would result in the Workflow having these Search Attributes:\n *\n * ```ts\n * {\n *   CustomIntField: [42],\n *   CustomBoolField: [true],\n *   CustomKeywordField: ['durable code', 'is great']\n * }\n * ```\n *\n * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.\n */\nexport function upsertSearchAttributes(searchAttributes: SearchAttributes): void {\n  const activator = getActivator();\n\n  const mergedSearchAttributes = { ...activator.info.searchAttributes, ...searchAttributes };\n  if (!mergedSearchAttributes) {\n    throw new Error('searchAttributes must be a non-null SearchAttributes');\n  }\n\n  activator.pushCommand({\n    upsertWorkflowSearchAttributes: {\n      searchAttributes: mapToPayloads(searchAttributePayloadConverter, searchAttributes),\n    },\n  });\n\n  activator.info.searchAttributes = mergedSearchAttributes;\n}\n\nexport const stackTraceQuery = defineQuery<string>('__stack_trace');\nexport const enhancedStackTraceQuery = defineQuery<EnhancedStackTrace>('__enhanced_stack_trace');\nexport const timeTravelStackTraceQuery = defineQuery<TimeTravelStackTrace>('__time_travel_stack_trace');\n",
        lineOffset: 0,
      },
    ],
  },
  stacks: {
    '8': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 10,
            column: 33,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [],
      },
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/workflow/src/workflow.ts',
            line: 715,
            column: 30,
            functionName: 'startChild',
          },
        ],
        correlatingEventIds: [],
      },
    ],
    '14': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [10, 11],
      },
    ],
    '18': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [10, 11],
      },
    ],
    '23': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [10],
      },
    ],
    '29': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [25, 26],
      },
    ],
    '34': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [25],
      },
    ],
    '41': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [36],
      },
    ],
    '45': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [36],
      },
    ],
    '52': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [47],
      },
    ],
    '56': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [47],
      },
    ],
    '63': [
      {
        locations: [
          {
            filePath:
              '/mnt/chonky/dev/temporal/sdk-node/packages/test/src/workflows/time-travel-stacks.ts',
            line: 15,
            column: 18,
            functionName: 'timeTravelStacks',
          },
        ],
        correlatingEventIds: [58],
      },
    ],
    '67': [],
  },
};
