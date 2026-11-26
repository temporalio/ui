import { describe, expect, test } from 'vitest';

import {
  isFilterableCustomSearchAttribute,
  workflowIncludesSearchAttribute,
} from './search-attributes';

describe('search attributes store', () => {
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

  describe('isFilterableCustomSearchAttribute', () => {
    const customAttributes = {
      CustomKeyword: 'Keyword',
      CustomText: 'Text',
      CustomInt: 'Int',
    } as const;

    test('returns true for a string Keyword value', () => {
      expect(
        isFilterableCustomSearchAttribute(
          customAttributes,
          'CustomKeyword',
          'value',
        ),
      ).toBe(true);
    });

    test('returns true for a string Text value', () => {
      expect(
        isFilterableCustomSearchAttribute(customAttributes, 'CustomText', 'a'),
      ).toBe(true);
    });

    test('returns false for a non-string value', () => {
      expect(
        isFilterableCustomSearchAttribute(
          customAttributes,
          'CustomKeyword',
          undefined,
        ),
      ).toBe(false);
    });

    test('returns false for other types', () => {
      expect(
        isFilterableCustomSearchAttribute(customAttributes, 'CustomInt', '1'),
      ).toBe(false);
    });

    test('returns false for unknown attributes', () => {
      expect(
        isFilterableCustomSearchAttribute(customAttributes, 'Unknown', 'a'),
      ).toBe(false);
    });
  });
});
