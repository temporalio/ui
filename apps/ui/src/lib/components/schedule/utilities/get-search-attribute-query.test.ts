import { describe, expect, it } from 'vitest';

import {
  escapeSearchAttributeValue,
  getSearchAttributeQuery,
} from './get-search-attribute-query';

describe('getSearchAttributeQuery', () => {
  it('uses registered types and equality rather than quick-filter range defaults', () => {
    expect(getSearchAttributeQuery('Tag', 'Keyword', 'a1')).toBe('`Tag`="a1"');
    expect(getSearchAttributeQuery('Count', 'Int', '42')).toBe('`Count`=42');
    expect(getSearchAttributeQuery('Count', 'Keyword', '42')).toBe(
      '`Count`="42"',
    );
    expect(getSearchAttributeQuery('Count', 'Int', 0)).toBe('`Count`=0');
    expect(getSearchAttributeQuery('Enabled', 'Bool', false)).toBe(
      '`Enabled`=false',
    );
    expect(
      getSearchAttributeQuery('Date', 'Datetime', '2026-10-09T12:00:00Z'),
    ).toBe('`Date`="2026-10-09T12:00:00Z"');
  });

  it('escapes string literals without changing their displayed source value', () => {
    const value = 'a\\" OR WorkflowId="other';
    expect(getSearchAttributeQuery('Tag', 'Keyword', value)).toBe(
      '`Tag`="a\\\\\\" OR WorkflowId=\\"other"',
    );
    expect(value).toBe('a\\" OR WorkflowId="other');
  });

  it('escapes each keyword-list item without changing the source array', () => {
    const values = ['a,b', 'c"d', 'e\\f'];
    expect(getSearchAttributeQuery('Tags', 'KeywordList', values)).toBe(
      '`Tags`in("a,b", "c\\"d", "e\\\\f")',
    );
    expect(values).toEqual(['a,b', 'c"d', 'e\\f']);
  });

  it('withholds queries for missing types, invalid values and undecodable payloads', () => {
    expect(getSearchAttributeQuery('Tag', undefined, 'a1')).toBeNull();
    expect(getSearchAttributeQuery('Tags', 'KeywordList', [])).toBeNull();
    expect(getSearchAttributeQuery('Count', 'Int', 'not a number')).toBeNull();
    expect(getSearchAttributeQuery('Count', 'Double', Infinity)).toBeNull();
    expect(getSearchAttributeQuery('Tag', 'Keyword', null)).toBeNull();
    expect(
      getSearchAttributeQuery('Tag', 'Keyword', { data: new Uint8Array() }),
    ).toBeNull();
  });
});

describe('escapeSearchAttributeValue', () => {
  it('escapes backslashes before quotes', () => {
    expect(escapeSearchAttributeValue('a\\"b')).toBe('a\\\\\\"b');
  });
});
