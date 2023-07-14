import { describe, expect, test } from 'vitest';

import {
  allSearchAttributes,
  isCustomSearchAttribute,
  workflowIncludesSearchAttribute,
} from './search-attributes';

describe('search attributes store', () => {
  describe('isCustomSearchAttribute', () => {
    test('returns false when the key is not a custom search attribute', () => {
      allSearchAttributes.set({
        systemAttributes: { WorkflowType: 'Keyword' },
        customAttributes: {},
      });
      expect(isCustomSearchAttribute('CustomBool')).toBe(false);
    });

    test('returns true when the key is a custom search attribute', () => {
      allSearchAttributes.set({
        systemAttributes: { WorkflowType: 'Keyword' },
        customAttributes: { CustomBool: 'Bool' },
      });
      expect(isCustomSearchAttribute('CustomBool')).toBe(true);
    });
  });

  describe('workflowIncludesSearchAttribute', () => {
    test('returns true when the search attribute is defined on the workflow', () => {
      const mockWorkflow = {
        name: 'Mock Workflow',
        id: 'abc-123',
        searchAttributes: {
          indexedFields: {
            CustomBool: true,
          },
        },
      };
      expect(workflowIncludesSearchAttribute(mockWorkflow, 'CustomBool')).toBe(
        true,
      );
    });

    test('returns false when the search attribute is not defined on the workflow', () => {
      const mockWorkflow = {
        name: 'Mock Workflow',
        id: 'abc-123',
        searchAttributes: {
          indexedFields: {
            CustomInt: true,
          },
        },
      };
      expect(workflowIncludesSearchAttribute(mockWorkflow, 'CustomBool')).toBe(
        false,
      );
    });

    test('returns false when searchAttributes are not defined on the workflow', () => {
      const mockWorkflow = {
        name: 'Mock Workflow',
        id: 'abc-123',
      };

      expect(workflowIncludesSearchAttribute(mockWorkflow, 'CustomBool')).toBe(
        false,
      );
    });

    test('returns false when indexedFields are not defined on the searchAttributes of the workflow', () => {
      const mockWorkflow = {
        name: 'Mock Workflow',
        id: 'abc-123',
        searchAttributes: {},
      };

      expect(workflowIncludesSearchAttribute(mockWorkflow, 'CustomBool')).toBe(
        false,
      );
    });
  });
});
