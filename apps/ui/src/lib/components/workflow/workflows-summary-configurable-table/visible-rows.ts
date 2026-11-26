import type { WorkflowExecution } from '$lib/types/workflows';

type RootRow = {
  rowType: 'root';
  childCount: number | undefined;
  value: WorkflowExecution;
};

type ChildRow = {
  rowType: 'child';
  parentRow: RootRow;
  value: WorkflowExecution;
};

export type VisibleRow = RootRow | ChildRow;

export function createVisibleRowsSelector() {
  // Keep keyed row props stable when only their order changes. Weak keys let
  // replaced API data be collected with its row metadata.
  const roots = new WeakMap<WorkflowExecution, RootRow>();
  const children = new WeakMap<WorkflowExecution, ChildRow>();

  return function selectVisibleRows(
    workflows: WorkflowExecution[],
    visibleChildren: ReadonlyMap<string, WorkflowExecution[]>,
  ): VisibleRow[] {
    return workflows.flatMap((workflow) => {
      const childWorkflows = visibleChildren.get(workflow.runId);
      let root = roots.get(workflow);
      if (!root || root.childCount !== childWorkflows?.length) {
        root = {
          rowType: 'root',
          childCount: childWorkflows?.length,
          value: workflow,
        };
        roots.set(workflow, root);
      }
      const parentRow = root;

      return [
        parentRow,
        ...(childWorkflows ?? []).map((workflow) => {
          let child = children.get(workflow);
          if (!child || child.parentRow !== parentRow) {
            child = { rowType: 'child', parentRow, value: workflow };
            children.set(workflow, child);
          }
          return child;
        }),
      ];
    });
  };
}
