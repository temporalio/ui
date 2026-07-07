import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import {
  addColumn,
  DEFAULT_DEPLOYMENTS_COLUMNS,
  moveColumn,
  persistedDeploymentsTableColumns,
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

describe('Deployment Table Columns store', () => {
  test('Latest Version is hidden by default', () => {
    expect(
      DEFAULT_DEPLOYMENTS_COLUMNS.some(
        ({ label }) => label === 'Latest Version',
      ),
    ).toBe(false);
  });

  describe('addColumn', () => {
    test('adds the Latest Version column and persists it', () => {
      persistedDeploymentsTableColumns.set({ default: [] });
      addColumn('Latest Version', 'default', TABLE_TYPE.DEPLOYMENTS);
      expect(get(persistedDeploymentsTableColumns)).toEqual({
        default: [{ label: 'Latest Version' }],
      });
    });
  });

  describe('removeColumn', () => {
    test('removes the Latest Version column', () => {
      persistedDeploymentsTableColumns.set({
        default: [{ label: 'Latest Version' }],
      });
      removeColumn('Latest Version', 'default', TABLE_TYPE.DEPLOYMENTS);
      expect(get(persistedDeploymentsTableColumns)).toEqual({ default: [] });
    });
  });
});
