import type { Options } from './scenario';
import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: 'system-nexus-signal-with-start',
  title: 'Signal With Start through the system Nexus endpoint',
  ticket: 'DT-4385',
  feature: 'src/lib/system-nexus-endpoints/signal-with-start-workflow',
  summary:
    'A workflow calls SignalWithStartWorkflowExecution on the __temporal_system Nexus endpoint. Both of the resulting events carry a binary/protobuf workflowservice message. Without this branch the UI shows the raw Nexus transport; with it the UI decodes the payload and shows the operation, its target, and the link back to the caller. The operation\'s target is the "signal-handlers" catalog example, so the workflow it starts and signals is one the catalog already runs.',
  server: {
    source: 'auto',
    requires: { serverCommit: '01aa279c462fd9e7efc8e0ba6bbc4554b51557dd' },
    dynamicConfig: {
      'history.enableChasm': true,
      'history.enableSignalWithStartFromWorkflow': true,
    },
    searchAttributes: {
      CustomKeywordField: 'Keyword',
      CustomIntField: 'Int',
    },
  },
  // The compiler checks these against the scenario beside this file, so a
  // mistyped option is an error here rather than a default used quietly.
  scenario: {
    targetExample: 'signal-handlers',
    targetWorkflowId: 'system-nexus-target',
    signalName: 'test-signal',
    signalInput: 'delivered by the system Nexus operation',
    memo: {
      demo: 'system-nexus-signal-with-start',
      ticket: 'DT-4385',
    },
  } satisfies Options,
  preview: {
    notes: [
      'Open the caller workflow\'s History tab. The two Nexus rows must read "Signal With Start Workflow Execution Initiated" and "\u2026 Delivered", not "Nexus Operation Scheduled" and "Nexus Operation Completed".',
      "Expand the Initiated row. It must show the target workflow ID, the signal name, and the caller's identity, and it must not show the endpoint, service, operation, or requestId transport fields. The server records the request as the caller sent it, so identity appears because the caller sets it; a 'control' row appears only for a caller that sets that field.",
      'Follow the target execution link from the Initiated row. It must land on the target workflow.',
      "Open the target workflow's History tab. Its Workflow Execution Signaled row must carry a link back to the caller.",
      "Switch the caller's history to Compact. The collapsed group row must read the operation label, not the raw Nexus event name.",
      'Open the Timeline tab on the caller. The operation must use the Nexus colour and icon.',
      'Open the catalog page for signal-handlers. It must show a worker polling its task queue, which is the same worker that ran the target.',
    ],
  },
});
