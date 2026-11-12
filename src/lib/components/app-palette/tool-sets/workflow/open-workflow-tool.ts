import type {
  PaletteAction,
  PaletteContext,
  PaletteTool,
  PaletteView,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';
import { IconTemporalWorkflow } from '$lib/io/icon';

import { openWorkflow } from './open-workflow';
import { parseWorkflowQuery } from './workflow-query';

export interface NamespacePickerOptions {
  id: string;
  title: string;
  // Title of the action on each namespace.
  actionTitle: string;
  onPick: (namespace: string, ctx: PaletteContext) => void | Promise<void>;
}

// A view that lists the namespaces the user can open. Each app lists its
// namespaces its own way.
export type NamespacePicker = (
  ctx: PaletteContext,
  options: NamespacePickerOptions,
) => PaletteView;

// Opens a workflow from a pasted URL or ID. Without a picker, only the
// namespace in the URL or the current namespace can open it.
export function openWorkflowTool(pickNamespace?: NamespacePicker): PaletteTool {
  return {
    id: 'open',
    get section() {
      return translate('palette-workflow.open-section');
    },
    icon: IconTemporalWorkflow,
    order: 10,
    items: () => [],
    search: (query, ctx) => {
      const parsed = parseWorkflowQuery(query);
      if (!parsed) return [];

      const { workflowId, runId } = parsed;
      const namespace = parsed.namespace ?? ctx.namespace();
      const pickAction: PaletteAction[] = pickNamespace
        ? [
            {
              title: translate('palette-workflow.open-elsewhere'),
              run: (runCtx) =>
                runCtx.push(
                  pickNamespace(runCtx, {
                    id: 'open-workflow-namespace',
                    title: translate('palette-workflow.choose-namespace'),
                    actionTitle: translate('palette-workflow.open-here'),
                    onPick: (picked, pickCtx) =>
                      openWorkflow(pickCtx, picked, workflowId, runId),
                  }),
                ),
            },
          ]
        : [];
      const openAction: PaletteAction[] = namespace
        ? [
            {
              title: translate('palette-workflow.open-in', { namespace }),
              run: (runCtx) =>
                openWorkflow(runCtx, namespace, workflowId, runId),
            },
          ]
        : [];
      const actions = [...openAction, ...pickAction];
      if (actions.length === 0) return [];

      return [
        {
          id: 'workflow-id',
          title: translate('palette-workflow.open-title', { workflowId }),
          subtitle: namespace
            ? translate('palette-workflow.open-subtitle', { namespace })
            : translate('palette-workflow.choose-namespace'),
          actions,
        },
      ];
    },
  };
}
