import { get } from 'svelte/store';
import { describe, test, expect } from 'vitest';
import {
  workflowTableColumns,
  addColumn,
  removeColumn,
  moveColumn,
  pinColumn,
} from './workflow-table-columns';

describe('Workflow Table Columns store', () => {
  describe('addColumn', () => {
    test('moves a column from the availableColumns array to the columns array', () => {
      workflowTableColumns.set([]);
      addColumn('Workflow ID');
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Workflow ID', pinned: false },
      ]);
    });
  });

  describe('removeColumn', () => {
    test('moves a column from the columns array to the availableColumns array and unpins it', () => {
      workflowTableColumns.set([{ label: 'Workflow ID', pinned: true }]);
      removeColumn('Workflow ID');
      expect(get(workflowTableColumns)).toEqual([]);
    });
  });

  describe('moveColumn', () => {
    test('moves an unpinned column up', () => {
      workflowTableColumns.set([
        { label: 'End', pinned: false },
        { label: 'Start', pinned: false },
      ]);
      moveColumn(1, 0);
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Start', pinned: false },
        { label: 'End', pinned: false },
      ]);
    });

    test('moves an unpinned column down', () => {
      workflowTableColumns.set([
        { label: 'End', pinned: false },
        { label: 'Start', pinned: false },
      ]);
      moveColumn(0, 1);
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Start', pinned: false },
        { label: 'End', pinned: false },
      ]);
    });

    test('moves a pinned column up', () => {
      workflowTableColumns.set([
        { label: 'End', pinned: true },
        { label: 'Start', pinned: true },
      ]);
      moveColumn(1, 0);
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
      ]);
    });

    test('moves a pinned column down', () => {
      workflowTableColumns.set([
        { label: 'End', pinned: true },
        { label: 'Start', pinned: true },
      ]);
      moveColumn(0, 1);
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
      ]);
    });

    test('pins the moved column if its moved above a pinned column, and unpins columns greater than the max amount allowed', () => {
      workflowTableColumns.set([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
        { label: 'Run ID', pinned: false },
        { label: 'Workflow ID', pinned: false },
        { label: 'History Length', pinned: false },
      ]);
      moveColumn(4, 0);
      expect(get(workflowTableColumns)).toEqual([
        { label: 'History Length', pinned: true },
        { label: 'Start', pinned: true },
        { label: 'End', pinned: false },
        { label: 'Run ID', pinned: false },
        { label: 'Workflow ID', pinned: false },
      ]);
    });

    test('unpins the moved column if its moved below the last pinned column', () => {
      workflowTableColumns.set([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
        { label: 'Run ID', pinned: false },
        { label: 'Workflow ID', pinned: false },
        { label: 'History Length', pinned: false },
      ]);
      moveColumn(0, 4);
      expect(get(workflowTableColumns)).toEqual([
        { label: 'End', pinned: true },
        { label: 'Run ID', pinned: false },
        { label: 'Workflow ID', pinned: false },
        { label: 'History Length', pinned: false },
        { label: 'Start', pinned: false },
      ]);
    });
  });

  describe('pinColumn', () => {
    test('will pin a column without needing to move it', () => {
      workflowTableColumns.set([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: false },
        { label: 'Run ID', pinned: false },
      ]);
      pinColumn('End');
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
        { label: 'Run ID', pinned: false },
      ]);
    });

    test('will pin and move a column below the last pinned column', () => {
      workflowTableColumns.set([
        { label: 'Start', pinned: true },
        { label: 'Run ID', pinned: false },
        { label: 'End', pinned: false },
      ]);
      pinColumn('End');
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
        { label: 'Run ID', pinned: false },
      ]);
    });

    test('will unpin and move a column below the last pinned column', () => {
      workflowTableColumns.set([
        { label: 'Start', pinned: true },
        { label: 'Run ID', pinned: true },
        { label: 'End', pinned: true },
      ]);
      pinColumn('Start');
      expect(get(workflowTableColumns)).toEqual([
        { label: 'Run ID', pinned: true },
        { label: 'End', pinned: true },
        { label: 'Start', pinned: false },
      ]);
    });
  });
});
