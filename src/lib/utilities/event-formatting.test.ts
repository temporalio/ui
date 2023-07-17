import { describe, expect, it } from 'vitest';

import { getDateFilterValue } from './event-formatting';

describe('getDateFilterValue', () => {
  it('should return default values for feed view as undefined', () => {
    const compact = false;
    const sortOrder = 'descending';
    const timeFormat = 'UTC';
    const showElapsed = 'false';
    const options = { compact, timeFormat, sortOrder, showElapsed };
    expect(getDateFilterValue(options)).toBe(undefined);
  });

  it('should return default values for compact view as undefined', () => {
    const compact = true;
    const sortOrder = 'ascending';
    const timeFormat = 'UTC';
    const showElapsed = 'false';
    const options = { compact, timeFormat, sortOrder, showElapsed };
    expect(getDateFilterValue(options)).toBe(undefined);
  });

  it('should return string value for feed view when not time format default', () => {
    const compact = false;
    const sortOrder = 'descending';
    const timeFormat = 'local';
    const showElapsed = 'false';
    const options = { compact, timeFormat, sortOrder, showElapsed };

    const value = `descending:local:false`;
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for feed view when not sort order default', () => {
    const compact = false;
    const sortOrder = 'ascending';
    const timeFormat = 'UTC';
    const showElapsed = 'false';
    const options = { compact, timeFormat, sortOrder, showElapsed };

    const value = `ascending:UTC:false`;
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for feed view when show elapsed', () => {
    const compact = false;
    const sortOrder = 'descending';
    const timeFormat = 'UTC';
    const showElapsed = 'true';
    const options = { compact, timeFormat, sortOrder, showElapsed };

    const value = `descending:UTC:true`;
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for feed view when multiple non-default values', () => {
    const compact = false;
    const sortOrder = 'ascending';
    const timeFormat = 'relative';
    const showElapsed = 'true';
    const options = { compact, timeFormat, sortOrder, showElapsed };

    const value = `ascending:relative:true`;
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for compact view when not sort order default', () => {
    const compact = true;
    const sortOrder = 'ascending';
    const timeFormat = 'local';
    const showElapsed = 'false';
    const options = { compact, timeFormat, sortOrder, showElapsed };

    const value = `ascending:local:false`;
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for compact view when multiple non-default values', () => {
    const compact = true;
    const sortOrder = 'ascending';
    const timeFormat = 'relative';
    const showElapsed = 'true';
    const options = { compact, timeFormat, sortOrder, showElapsed };

    const value = `ascending:relative:true`;
    expect(getDateFilterValue(options)).toBe(value);
  });
});
