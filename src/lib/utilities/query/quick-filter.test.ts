import { describe, expect, it } from 'vitest';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
} from '$lib/types/workflows';

import { toListWorkflowQueryFromFilters } from './filter-workflow-query';
import {
  createQuickFilter,
  formatQuickFilterValue,
  getDefaultConditional,
  isQuickFilterActive,
  toggleQuickFilter,
  toQuickFilterValue,
} from './quick-filter';
import {
  createFilter,
  toListWorkflowFilters,
} from './to-list-workflow-filters';

const attributes: SearchAttributes = {
  ExecutionStatus: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  StartTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
  CustomBoolField: SEARCH_ATTRIBUTE_TYPE.BOOL,
  CustomIntField: SEARCH_ATTRIBUTE_TYPE.INT,
  CustomDoubleField: SEARCH_ATTRIBUTE_TYPE.DOUBLE,
  CustomKeywordField: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  CustomTextField: SEARCH_ATTRIBUTE_TYPE.TEXT,
  CustomKeywordListField: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
};

describe('getDefaultConditional', () => {
  it('uses >= for Datetime so a quick filter reads as "at or after this value"', () => {
    expect(getDefaultConditional(SEARCH_ATTRIBUTE_TYPE.DATETIME)).toBe('>=');
  });

  it('uses in for KeywordList', () => {
    expect(getDefaultConditional(SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST)).toBe('in');
  });

  it.each([
    SEARCH_ATTRIBUTE_TYPE.BOOL,
    SEARCH_ATTRIBUTE_TYPE.INT,
    SEARCH_ATTRIBUTE_TYPE.DOUBLE,
    SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    SEARCH_ATTRIBUTE_TYPE.TEXT,
    SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED,
  ])('uses = for %s', (type) => {
    expect(getDefaultConditional(type)).toBe('=');
  });
});

describe('formatQuickFilterValue', () => {
  const format = (type, value) =>
    formatQuickFilterValue({
      type,
      value,
      conditional: getDefaultConditional(type),
    });

  it('formats a Bool from a real boolean and from a string', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.BOOL, true)).toBe('true');
    expect(format(SEARCH_ATTRIBUTE_TYPE.BOOL, false)).toBe('false');
    expect(format(SEARCH_ATTRIBUTE_TYPE.BOOL, 'TRUE')).toBe('true');
  });

  it('rejects a Bool that is neither a boolean nor true/false', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.BOOL, 'yes')).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.BOOL, 1)).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.BOOL, undefined)).toBeNull();
  });

  it('keeps numbers unreformatted, including zero and negatives', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.INT, 0)).toBe('0');
    expect(format(SEARCH_ATTRIBUTE_TYPE.INT, -5)).toBe('-5');
    expect(format(SEARCH_ATTRIBUTE_TYPE.INT, '1024')).toBe('1024');
    expect(format(SEARCH_ATTRIBUTE_TYPE.DOUBLE, 1.5)).toBe('1.5');
  });

  it('rejects values that are not numbers', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.INT, 'abc')).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.INT, '')).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.INT, NaN)).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.DOUBLE, Infinity)).toBeNull();
  });

  it('passes a Datetime through as the raw ISO string', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.DATETIME, '2024-01-02T03:04:05Z')).toBe(
      '2024-01-02T03:04:05Z',
    );
  });

  it('normalizes a protobuf Timestamp, a Date and an epoch number to ISO', () => {
    expect(
      format(SEARCH_ATTRIBUTE_TYPE.DATETIME, {
        seconds: 1704164645,
        nanos: 0,
      }),
    ).toBe('2024-01-02T03:04:05.000Z');
    expect(
      format(SEARCH_ATTRIBUTE_TYPE.DATETIME, new Date('2024-01-02T03:04:05Z')),
    ).toBe('2024-01-02T03:04:05.000Z');
    expect(format(SEARCH_ATTRIBUTE_TYPE.DATETIME, 1704164645000)).toBe(
      '2024-01-02T03:04:05.000Z',
    );
  });

  it('rejects an unparseable Date', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.DATETIME, new Date('nope'))).toBeNull();
  });

  it('rejects a Datetime that is not parseable, such as a formatted cell value', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.DATETIME, 'not a date')).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.DATETIME, '')).toBeNull();
  });

  it('wraps a KeywordList in the parenthesized literal the in conditional expects', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST, ['a', 'b'])).toBe(
      '("a", "b")',
    );
  });

  it('wraps a single-element KeywordList the same way', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST, ['a'])).toBe('("a")');
  });

  it('rejects an empty KeywordList', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST, [])).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST, ['', ''])).toBeNull();
  });

  it('does not parenthesize a KeywordList for a non-in conditional', () => {
    expect(
      formatQuickFilterValue({
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
        value: ['a'],
        conditional: '=',
      }),
    ).toBe('a');
  });

  it('passes Keyword and Text through, rejecting empty strings', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORD, 'my-task-queue')).toBe(
      'my-task-queue',
    );
    expect(format(SEARCH_ATTRIBUTE_TYPE.TEXT, 'some text')).toBe('some text');
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORD, '')).toBeNull();
    expect(format(SEARCH_ATTRIBUTE_TYPE.KEYWORD, 42)).toBeNull();
  });

  it('rejects an unspecified type', () => {
    expect(format(SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED, 'anything')).toBeNull();
  });
});

describe('createQuickFilter', () => {
  it('sets the conditional from the type and leaves the join fields empty', () => {
    const filter = createQuickFilter({
      attribute: 'StartTime',
      type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      value: '2024-01-02T03:04:05Z',
    });

    expect(filter).toMatchObject({
      attribute: 'StartTime',
      type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      value: '2024-01-02T03:04:05Z',
      conditional: '>=',
      operator: '',
      parenthesis: '',
    });
  });

  it('returns null when the attribute has no known type', () => {
    expect(
      createQuickFilter({
        attribute: 'ParentNamespace',
        type: undefined,
        value: 'default',
      }),
    ).toBeNull();
  });

  it('returns null when the value cannot be filtered on', () => {
    expect(
      createQuickFilter({
        attribute: 'CustomIntField',
        type: SEARCH_ATTRIBUTE_TYPE.INT,
        value: '',
      }),
    ).toBeNull();
  });
});

describe('quick filter round trip', () => {
  const cases: [string, string, unknown, string][] = [
    [
      'CustomBoolField',
      SEARCH_ATTRIBUTE_TYPE.BOOL,
      true,
      '`CustomBoolField`=true',
    ],
    ['CustomIntField', SEARCH_ATTRIBUTE_TYPE.INT, 42, '`CustomIntField`=42'],
    [
      'CustomDoubleField',
      SEARCH_ATTRIBUTE_TYPE.DOUBLE,
      1.5,
      '`CustomDoubleField`=1.5',
    ],
    [
      'StartTime',
      SEARCH_ATTRIBUTE_TYPE.DATETIME,
      '2024-01-02T03:04:05Z',
      '`StartTime`>="2024-01-02T03:04:05Z"',
    ],
    [
      'CustomKeywordListField',
      SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
      ['Hello', 'World'],
      '`CustomKeywordListField`in("Hello", "World")',
    ],
    [
      'CustomKeywordField',
      SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      'my-value',
      '`CustomKeywordField`="my-value"',
    ],
    [
      'CustomTextField',
      SEARCH_ATTRIBUTE_TYPE.TEXT,
      'some text',
      '`CustomTextField`="some text"',
    ],
  ];

  it.each(cases)(
    'emits and reparses a %s quick filter',
    (attribute, type, value, expectedQuery) => {
      const filter = createQuickFilter({ attribute, type, value });
      expect(filter).not.toBeNull();

      const query = toListWorkflowQueryFromFilters([filter]);
      expect(query).toBe(expectedQuery);

      const [parsed] = toListWorkflowFilters(query, attributes);
      expect(parsed).toMatchObject({
        attribute: filter.attribute,
        type: filter.type,
        value: filter.value,
        conditional: filter.conditional,
      });
    },
  );
});

describe('isQuickFilterActive', () => {
  const quickFilter = createQuickFilter({
    attribute: 'CustomKeywordField',
    type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    value: 'my-value',
  });

  it('is active when the only filter for the attribute matches', () => {
    expect(isQuickFilterActive([quickFilter], quickFilter)).toBe(true);
  });

  it('is inactive when no filters are set', () => {
    expect(isQuickFilterActive([], quickFilter)).toBe(false);
  });

  it('is inactive for a different value on the same attribute', () => {
    const other = createFilter({ ...quickFilter, value: 'other-value' });
    expect(isQuickFilterActive([other], quickFilter)).toBe(false);
  });

  it('is inactive when the conditional differs', () => {
    const before = createFilter({
      attribute: 'StartTime',
      type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      value: '2024-01-02T03:04:05Z',
      conditional: '<=',
    });
    const after = createQuickFilter({
      attribute: 'StartTime',
      type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      value: '2024-01-02T03:04:05Z',
    });

    expect(isQuickFilterActive([before], after)).toBe(false);
  });

  it('is inactive for a custom date range even if the value matches', () => {
    const between = createFilter({
      ...quickFilter,
      customDate: true,
    });
    expect(isQuickFilterActive([between], quickFilter)).toBe(false);
  });

  it('is inactive while several statuses are OR-ed together', () => {
    const statuses = ['Running', 'Completed', 'Failed'].map((value) =>
      createFilter({
        attribute: 'ExecutionStatus',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        value,
        conditional: '=',
      }),
    );
    const completed = createQuickFilter({
      attribute: 'ExecutionStatus',
      type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      value: 'Completed',
    });

    expect(isQuickFilterActive(statuses, completed)).toBe(false);
  });
});

describe('toggleQuickFilter', () => {
  const keywordFilter = createQuickFilter({
    attribute: 'CustomKeywordField',
    type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    value: 'my-value',
  });

  it('adds the filter when nothing is set', () => {
    expect(toggleQuickFilter([], keywordFilter)).toEqual([keywordFilter]);
  });

  it('removes the filter when it is already active', () => {
    expect(toggleQuickFilter([keywordFilter], keywordFilter)).toEqual([]);
  });

  it('replaces an existing filter on the same attribute', () => {
    const existing = createFilter({ ...keywordFilter, value: 'other-value' });
    expect(toggleQuickFilter([existing], keywordFilter)).toEqual([
      keywordFilter,
    ]);
  });

  it('leaves filters on other attributes alone', () => {
    const other: SearchAttributeFilter = createFilter({
      attribute: 'CustomIntField',
      type: SEARCH_ATTRIBUTE_TYPE.INT,
      value: '42',
      conditional: '=',
    });

    expect(toggleQuickFilter([other], keywordFilter)).toEqual([
      other,
      keywordFilter,
    ]);
  });

  it('collapses a multi-status OR group down to the clicked status', () => {
    const statuses = ['Running', 'Completed', 'Failed'].map((value) =>
      createFilter({
        attribute: 'ExecutionStatus',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        value,
        conditional: '=',
      }),
    );
    const completed = createQuickFilter({
      attribute: 'ExecutionStatus',
      type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      value: 'Completed',
    });

    expect(toggleQuickFilter(statuses, completed)).toEqual([completed]);
  });
});

describe('toQuickFilterValue', () => {
  it('returns the value a quick filter would use without building a filter', () => {
    expect(
      toQuickFilterValue({
        attribute: 'CustomKeywordListField',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
        value: ['a', 'b'],
      }),
    ).toBe('("a", "b")');
  });

  it('returns null when the column has no attribute or no type', () => {
    expect(
      toQuickFilterValue({
        attribute: '',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        value: 'a',
      }),
    ).toBeNull();
    expect(
      toQuickFilterValue({
        attribute: 'ParentNamespace',
        type: undefined,
        value: 'default',
      }),
    ).toBeNull();
  });
});
