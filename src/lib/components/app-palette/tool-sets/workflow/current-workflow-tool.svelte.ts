import { fromStore, get } from 'svelte/store';

import { page } from '$app/state';

import type {
  PaletteAction,
  PaletteContext,
  PaletteItem,
  PaletteTool,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';
import {
  IconCanceled,
  IconCopy,
  IconDownload,
  IconTemporalSignal,
  IconTemporalWorkflow,
  IconXmarkCircleSolid,
} from '$lib/io/icon';
import { Action } from '$lib/models/workflow-actions';
import {
  cancelWorkflow,
  terminateWorkflow,
} from '$lib/services/workflow-service';
import { downloadEventHistorySetting } from '$lib/stores/events';
import { triggerRefresh, workflowRun } from '$lib/stores/workflow-run';
import type { Settings } from '$lib/types/global';
import type { WorkflowExecution } from '$lib/types/workflows';
import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';

import { downloadHistory } from './download-history';
import { signalNames } from './signal-input';
import { signalNameView } from './signal-views';
import {
  acceptsWriteActions,
  describeCommand,
  requestErrorMessage,
  writeActionBlock,
  type WriteActionBlock,
} from './workflow-query';

const run = fromStore(workflowRun);

async function copy(ctx: PaletteContext, text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    ctx.toast(done, 'success');
  } catch {
    ctx.toast(translate('palette-workflow.copy-failed'), 'error');
  }
}

function copyItem(
  id: string,
  title: string,
  subtitle: string,
  text: string,
): PaletteItem {
  return {
    id,
    title,
    subtitle,
    icon: IconCopy,
    keywords: ['copy'],
    actions: [
      {
        title: translate('palette-workflow.copy'),
        run: (ctx) => copy(ctx, text, translate('palette-workflow.copied')),
      },
    ],
  };
}

function blockReason(
  block: WriteActionBlock | undefined,
  namespace: string,
): string | undefined {
  if (!block) return undefined;
  return translate(`palette-workflow.blocked-${block}`, { namespace });
}

function currentWorkflowItems(
  ctx: PaletteContext,
  identity: string | undefined,
): PaletteItem[] {
  const subject = ctx.subject();
  if (subject?.kind !== 'workflow') return [];

  const { namespace, workflowId } = subject;
  // The store can still hold another run of the same workflow while the
  // page loads, so it counts only when the run IDs agree.
  const loaded = run.current.workflow;
  const sameRun = !subject.runId || loaded?.runId === subject.runId;
  const workflow = loaded?.id === workflowId && sameRun ? loaded : undefined;
  const runId = subject.runId ?? workflow?.runId;

  // The same checks the workflow page's action menu makes.
  const settings: Settings = page.data.settings;
  const pauseEnabled =
    !!page.data.namespace?.namespaceInfo?.capabilities?.workflowPause;
  const accepts = acceptsWriteActions(workflow, pauseEnabled);
  const cancelBlock = writeActionBlock({
    allowed: !!settings && workflowCancelEnabled(namespace, settings),
    accepts,
  });
  const terminateBlock = writeActionBlock({
    allowed: !!settings && workflowTerminateEnabled(namespace, settings),
    accepts,
  });
  const signalBlock = writeActionBlock({
    allowed: !!settings && workflowSignalEnabled(namespace, settings),
    accepts,
  });

  const items: PaletteItem[] = [
    copyItem(
      'copy-id',
      translate('palette-workflow.copy-id'),
      workflowId,
      workflowId,
    ),
  ];
  if (runId) {
    items.push(
      copyItem(
        'copy-run',
        translate('palette-workflow.copy-run'),
        runId,
        runId,
      ),
    );
  }
  items.push(
    copyItem(
      'copy-cli',
      translate('palette-workflow.copy-cli'),
      'temporal workflow describe',
      describeCommand(namespace, workflowId, runId),
    ),
    {
      id: 'download',
      icon: IconDownload,
      title: translate('palette-workflow.download'),
      keywords: ['export', 'json', 'history'],
      disabled: runId
        ? undefined
        : translate('palette-workflow.blocked-loading'),
      actions: [
        {
          title: translate('palette-workflow.download-action'),
          run: async (ctx) => {
            if (!runId) return;
            try {
              await downloadHistory({
                namespace,
                workflowId,
                runId,
                decodeSetting: get(downloadEventHistorySetting),
              });
              ctx.toast(translate('palette-workflow.downloaded'), 'success');
            } catch {
              ctx.toast(translate('palette-workflow.download-failed'), 'error');
            }
          },
        },
      ],
    },
  );

  const writeAction = (
    action: 'cancel' | 'terminate',
    block: WriteActionBlock | undefined,
    perform: (target: WorkflowExecution) => Promise<unknown>,
  ): PaletteAction => ({
    title: translate(`palette-workflow.${action}-action`),
    destructive: true,
    confirm: translate(`palette-workflow.${action}-confirm`, { workflowId }),
    disabled: blockReason(block, namespace),
    run: async (ctx) => {
      if (!workflow) return;
      try {
        await perform(workflow);
      } catch (error) {
        ctx.toast(
          requestErrorMessage(
            error,
            translate('palette-workflow.request-failed'),
          ),
          'error',
        );
        return;
      }
      triggerRefresh(action === 'cancel' ? Action.Cancel : Action.Terminate);
      ctx.toast(translate(`palette-workflow.${action}-success`), 'success');
    },
  });

  items.push(
    {
      id: 'cancel',
      icon: IconCanceled,
      title: translate('palette-workflow.cancel'),
      subtitle: blockReason(cancelBlock, namespace),
      keywords: ['stop'],
      actions: [
        writeAction('cancel', cancelBlock, (target) =>
          cancelWorkflow({ namespace, workflow: target, identity }),
        ),
      ],
    },
    {
      id: 'terminate',
      icon: IconXmarkCircleSolid,
      title: translate('palette-workflow.terminate'),
      subtitle: blockReason(terminateBlock, namespace),
      keywords: ['kill', 'stop'],
      actions: [
        writeAction('terminate', terminateBlock, (target) =>
          terminateWorkflow({
            namespace,
            workflow: target,
            reason: translate('palette-workflow.terminate-reason'),
            first: undefined,
            identity,
          }),
        ),
      ],
    },
    {
      id: 'signal',
      icon: IconTemporalSignal,
      title: translate('palette-workflow.signal'),
      subtitle: blockReason(signalBlock, namespace),
      keywords: ['send', 'message'],
      actions: [
        {
          title: translate('palette-workflow.signal-choose'),
          disabled: blockReason(signalBlock, namespace),
          run: (ctx) => {
            if (!workflow) return;
            ctx.push(
              signalNameView(
                { namespace, workflow, identity },
                signalNames(
                  run.current.metadata?.definition?.signalDefinitions,
                ),
              ),
            );
          },
        },
      ],
    },
  );
  return items;
}

// The actions on the open workflow page. `identity` names the user in the
// workflow history, as the workflow page's own actions do.
export function currentWorkflowTool(
  identity: () => string | undefined,
): PaletteTool {
  return {
    id: 'current',
    get section() {
      return translate('palette-workflow.current-section');
    },
    icon: IconTemporalWorkflow,
    placement: 'page',
    order: 20,
    items: (ctx) => currentWorkflowItems(ctx, identity()),
  };
}
