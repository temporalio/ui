import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import {
  addColumn,
  moveColumn,
  persistedWorkflowTableColumns,
  removeColumn,
  TABLE_TYPE,
} from './configurable-table-columns';

describe('Workflow Table Columns store', () => {
  describe('addColumn', () => {
    test('moves a column from the availableColumns array to the columns array', () => {
      persistedWorkflowTableColumns.set({ default: [] });
      addColumn('Workflow ID', 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Workflow ID' }],
      });
    });
  });

  describe('removeColumn', () => {
    test('moves a column from the columns array to the availableColumns array and unpins it', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'Workflow ID' }],
      });
      removeColumn('Workflow ID', 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({ default: [] });
    });
  });

  describe('moveColumn', () => {
    test('moves a column up', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'End' }, { label: 'Start' }],
      });
      moveColumn(1, 0, 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Start' }, { label: 'End' }],
      });
    });

    test('moves a column down', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'End' }, { label: 'Start' }],
      });
      moveColumn(0, 1, 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Start' }, { label: 'End' }],
      });
    });
  });
});
