import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import {
  addColumn,
  DEFAULT_DEPLOYMENTS_COLUMNS,
  migrateColumnLabels,
  MIN_COLUMN_WIDTH,
  moveColumn,
  persistedDeploymentsTableColumns,
  persistedWorkflowTableColumns,
  removeColumn,
  resizeColumn,
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

  describe('resizeColumn', () => {
    test('sets the width of the targeted column only', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'Start' }, { label: 'End' }],
      });
      resizeColumn('Start', 240, 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Start', width: 240 }, { label: 'End' }],
      });
    });

    test('clamps the width to the minimum column width', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'Start' }],
      });
      resizeColumn('Start', 10, 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Start', width: MIN_COLUMN_WIDTH }],
      });
    });

    test('removes the width when resizing to undefined', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'Start', width: 240 }],
      });
      resizeColumn('Start', undefined, 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Start' }],
      });
    });

    test('preserves other column properties', () => {
      persistedWorkflowTableColumns.set({
        default: [{ label: 'Start', pinned: true, width: 100 }],
      });
      resizeColumn('Start', 240, 'default', TABLE_TYPE.WORKFLOWS);
      expect(get(persistedWorkflowTableColumns)).toEqual({
        default: [{ label: 'Start', pinned: true, width: 240 }],
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

describe('migrateColumnLabels', () => {
  const migrate = migrateColumnLabels({
    'Start Time': 'Start',
    'Close Time': 'End',
    'Activity Type': 'Type',
  });

  test('renames columns matching the provided label map', () => {
    const state = {
      default: [
        { label: 'Status' },
        { label: 'Activity Type' },
        { label: 'Start Time' },
        { label: 'Close Time' },
      ],
    };

    expect(migrate(state)).toEqual({
      default: [
        { label: 'Status' },
        { label: 'Type' },
        { label: 'Start' },
        { label: 'End' },
      ],
    });
  });

  test('preserves other column properties like pinned', () => {
    const state = {
      default: [{ label: 'Activity Type', pinned: true }],
    };

    expect(migrate(state)).toEqual({
      default: [{ label: 'Type', pinned: true }],
    });
  });

  test('migrates labels across multiple namespaces', () => {
    const state = {
      default: [{ label: 'Start Time' }],
      other: [{ label: 'Close Time' }],
    };

    expect(migrate(state)).toEqual({
      default: [{ label: 'Start' }],
      other: [{ label: 'End' }],
    });
  });

  test('dedupes when a renamed label collides with an existing one', () => {
    const state = {
      default: [{ label: 'Start' }, { label: 'Start Time' }],
    };

    expect(migrate(state)).toEqual({
      default: [{ label: 'Start' }],
    });
  });

  test('returns the same reference when nothing needs migrating', () => {
    const state = {
      default: [{ label: 'Status' }, { label: 'Type' }, { label: 'Start' }],
    };

    expect(migrate(state)).toBe(state);
  });

  test('handles undefined namespace columns', () => {
    const state = { default: undefined };

    expect(migrate(state)).toEqual({ default: undefined });
  });
});
