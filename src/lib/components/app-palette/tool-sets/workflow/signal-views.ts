import type {
  PaletteItem,
  PaletteView,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';
import { Action } from '$lib/models/workflow-actions';
import { signalWorkflow } from '$lib/services/workflow-service';
import { triggerRefresh } from '$lib/stores/workflow-run';
import type { WorkflowExecution } from '$lib/types/workflows';

import { isValidSignalInput } from './signal-input';
import { requestErrorMessage } from './workflow-query';

interface SignalTarget {
  namespace: string;
  workflow: WorkflowExecution;
  identity?: string;
}

function sendItem(
  target: SignalTarget,
  name: string,
  input: string,
): PaletteItem {
  const valid = isValidSignalInput(input);
  return {
    id: input ? 'send-input' : 'send-empty',
    title: input
      ? translate('palette-workflow.signal-send-input', { name })
      : translate('palette-workflow.signal-send-empty', { name }),
    subtitle: input || undefined,
    disabled: valid
      ? undefined
      : translate('palette-workflow.signal-invalid-json'),
    actions: [
      {
        title: translate('palette-workflow.signal-send'),
        confirm: translate('palette-workflow.signal-confirm', {
          name,
          workflowId: target.workflow.id,
        }),
        run: async (ctx) => {
          try {
            await signalWorkflow({
              namespace: target.namespace,
              workflow: target.workflow,
              name,
              input,
              encoding: 'json/plain',
              messageType: '',
              identity: target.identity,
            });
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
          triggerRefresh(Action.Signal);
          ctx.close();
          ctx.toast(
            translate('palette-workflow.signal-success', { name }),
            'success',
          );
        },
      },
    ],
  };
}

function signalInputView(target: SignalTarget, name: string): PaletteView {
  return {
    id: 'signal-input',
    title: name,
    placeholder: translate('palette-workflow.signal-input-placeholder'),
    items: () => [sendItem(target, name, '')],
    search: (query) => [sendItem(target, name, query)],
  };
}

// Lists the signals the workflow declares, and lets the user type any other
// name, because most workflows do not declare their signals.
export function signalNameView(
  target: SignalTarget,
  declared: readonly string[],
): PaletteView {
  const nameItem = (name: string, id: string): PaletteItem => ({
    id,
    title: name,
    actions: [
      {
        title: translate('palette-workflow.signal-choose'),
        run: (ctx) => ctx.push(signalInputView(target, name)),
      },
    ],
  });

  return {
    id: 'signal-name',
    title: translate('palette-workflow.signal'),
    placeholder: translate('palette-workflow.signal-name-placeholder'),
    emptyText: translate('palette-workflow.signal-name-empty'),
    items: () => declared.map((name) => nameItem(name, `declared-${name}`)),
    search: (query) =>
      declared.includes(query) ? [] : [nameItem(query, 'typed')],
  };
}
