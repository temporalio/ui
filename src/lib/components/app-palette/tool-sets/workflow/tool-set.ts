import type {
  PaletteRules,
  PaletteToolSet,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';

import { type NamespacePicker, openWorkflowTool } from './open-workflow-tool';

import { currentWorkflowTool } from './current-workflow-tool.svelte';

export interface WorkflowToolSetOptions {
  // Names the user in the workflow history for cancel, terminate and signal.
  identity?: () => string | undefined;
  // Lets the user open a workflow in another namespace.
  pickNamespace?: NamespacePicker;
  rules?: PaletteRules;
}

// Tools for one workflow: open it by URL or ID, and copy, download, cancel,
// terminate or signal it from its page.
export function workflowToolSet({
  identity = () => undefined,
  pickNamespace,
  rules,
}: WorkflowToolSetOptions = {}): PaletteToolSet {
  return {
    id: 'workflow',
    get label() {
      return translate('palette-workflow.label');
    },
    key: 'w',
    order: 20,
    rules,
    tools: [openWorkflowTool(pickNamespace), currentWorkflowTool(identity)],
  };
}
