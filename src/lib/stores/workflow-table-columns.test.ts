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
      workflowTableColumns.set({
        columns: [],
        availableColumns: [{ label: 'Workflow ID', pinned: false }],
      });
      addColumn(0);
      expect(get(workflowTableColumns)).toEqual({
        columns: [{ label: 'Workflow ID', pinned: false }],
        availableColumns: [],
      });
    });
  });

  describe('removeColumn', () => {
    test('moves a column from the columns array to the availableColumns array and unpins it', () => {
      workflowTableColumns.set({
        columns: [{ label: 'Workflow ID', pinned: true }],
        availableColumns: [],
      });
      removeColumn(0);
      expect(get(workflowTableColumns)).toEqual({
        columns: [],
        availableColumns: [{ label: 'Workflow ID', pinned: false }],
      });
    });
  });

  describe('moveColumn', () => {
    test('moves an unpinned column up', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'End', pinned: false },
          { label: 'Start', pinned: false },
        ],
        availableColumns: [],
      });
      moveColumn(1, 0);
      expect(get(workflowTableColumns)?.columns).toEqual([
        { label: 'Start', pinned: false },
        { label: 'End', pinned: false },
      ]);
    });

    test('moves an unpinned column down', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'End', pinned: false },
          { label: 'Start', pinned: false },
        ],
        availableColumns: [],
      });
      moveColumn(0, 1);
      expect(get(workflowTableColumns)?.columns).toEqual([
        { label: 'Start', pinned: false },
        { label: 'End', pinned: false },
      ]);
    });

    test('moves a pinned column up', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'End', pinned: true },
          { label: 'Start', pinned: true },
        ],
        availableColumns: [],
      });
      moveColumn(1, 0);
      expect(get(workflowTableColumns)?.columns).toEqual([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
      ]);
    });

    test('moves a pinned column down', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'End', pinned: true },
          { label: 'Start', pinned: true },
        ],
        availableColumns: [],
      });
      moveColumn(0, 1);
      expect(get(workflowTableColumns)?.columns).toEqual([
        { label: 'Start', pinned: true },
        { label: 'End', pinned: true },
      ]);
    });

    test('pins the moved column if its moved above a pinned column, and unpins columns greater than the max amount allowed', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'Workflow ID', pinned: false },
          { label: 'History Length', pinned: false },
        ],
        availableColumns: [],
      });
      moveColumn(4, 0);
      expect(get(workflowTableColumns)?.columns).toEqual([
        { label: 'History Length', pinned: true },
        { label: 'Start', pinned: true },
        { label: 'End', pinned: false },
        { label: 'Run ID', pinned: false },
        { label: 'Workflow ID', pinned: false },
      ]);
    });

    test('unpins the moved column if its moved below the last pinned column', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'Workflow ID', pinned: false },
          { label: 'History Length', pinned: false },
        ],
        availableColumns: [],
      });
      moveColumn(0, 4);
      expect(get(workflowTableColumns)?.columns).toEqual([
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
      workflowTableColumns.set({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: false },
          { label: 'Run ID', pinned: false },
        ],
        availableColumns: [],
      });
      pinColumn(1);
      expect(get(workflowTableColumns)).toEqual({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
        ],
        availableColumns: [],
      });
    });

    test('will pin and move a column below the last pinned column', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'End', pinned: false },
        ],
        availableColumns: [],
      });
      pinColumn(2);
      expect(get(workflowTableColumns)).toEqual({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
        ],
        availableColumns: [],
      });
    });

    test('will unpin and move a column below the last pinned column', () => {
      workflowTableColumns.set({
        columns: [
          { label: 'Start', pinned: true },
          { label: 'Run ID', pinned: true },
          { label: 'End', pinned: true },
        ],
        availableColumns: [],
      });
      pinColumn(0);
      expect(get(workflowTableColumns)).toEqual({
        columns: [
          { label: 'Run ID', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Start', pinned: false },
        ],
        availableColumns: [],
      });
    });
  });
});
