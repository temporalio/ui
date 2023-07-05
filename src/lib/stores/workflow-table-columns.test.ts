import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import {
  addColumn,
  moveColumn,
  persistedWorkflowTableColumns,
  pinColumn,
  removeColumn,
} from './workflow-table-columns';

describe('Workflow Table Columns store', () => {
  describe('addColumn', () => {
    test('moves a column from the availableColumns array to the columns array', () => {
      persistedWorkflowTableColumns.set({ default: [] });
      addColumn('Workflow ID', 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Workflow ID', pinned: false }],
      });
    });
  });

  describe('removeColumn', () => {
    test('moves a column from the columns array to the availableColumns array and unpins it', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'Workflow ID', pinned: true }],
      });
      removeColumn('Workflow ID', 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({ default: [] });
    });
  });

  describe('moveColumn', () => {
    test('moves an unpinned column up', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'End', pinned: false },
          { label: 'Start', pinned: false },
        ],
      });
      moveColumn(1, 0, 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: false },
        ],
      });
    });

    test('moves an unpinned column down', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'End', pinned: false },
          { label: 'Start', pinned: false },
        ],
      });
      moveColumn(0, 1, 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Start', pinned: false },
          { label: 'End', pinned: false },
        ],
      });
    });

    test('moves a pinned column up', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'End', pinned: true },
          { label: 'Start', pinned: true },
        ],
      });
      moveColumn(1, 0, 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
        ],
      });
    });

    test('moves a pinned column down', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'End', pinned: true },
          { label: 'Start', pinned: true },
        ],
      });
      moveColumn(0, 1, 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
        ],
      });
    });

    test('pins the moved column if its moved above a pinned column, and unpins columns greater than the max amount allowed', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'Workflow ID', pinned: false },
          { label: 'History Length', pinned: false },
        ],
      });
      moveColumn(4, 0, 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'History Length', pinned: true },
          { label: 'Start', pinned: true },
          { label: 'End', pinned: false },
          { label: 'Run ID', pinned: false },
          { label: 'Workflow ID', pinned: false },
        ],
      });
    });

    test('unpins the moved column if its moved below the last pinned column', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'Workflow ID', pinned: false },
          { label: 'History Length', pinned: false },
        ],
      });
      moveColumn(0, 4, 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'Workflow ID', pinned: false },
          { label: 'History Length', pinned: false },
          { label: 'Start', pinned: false },
        ],
      });
    });
  });

  describe('pinColumn', () => {
    test('will pin a column without needing to move it', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: false },
          { label: 'Run ID', pinned: false },
        ],
      });
      pinColumn('End', 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
        ],
      });
    });

    test('will pin and move a column below the last pinned column', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'Start', pinned: true },
          { label: 'Run ID', pinned: false },
          { label: 'End', pinned: false },
        ],
      });
      pinColumn('End', 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Start', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Run ID', pinned: false },
        ],
      });
    });

    test('will unpin and move a column below the last pinned column', () => {
      persistedWorkflowTableColumns.set({
        default: [
          { label: 'Start', pinned: true },
          { label: 'Run ID', pinned: true },
          { label: 'End', pinned: true },
        ],
      });
      pinColumn('Start', 'default');
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [
          { label: 'Run ID', pinned: true },
          { label: 'End', pinned: true },
          { label: 'Start', pinned: false },
        ],
      });
    });
  });
});
