import { describe, expect, it } from 'vitest';

import { getDateFilterValue } from './event-formatting';

describe('getDateFilterValue', () => {
  it('should return default values for feed view as undefined', () => {
    const compact = false;
    const sortOrder = 'descending';
    const showElapsed = 'false';
    const options = { compact, sortOrder, showElapsed };
    expect(getDateFilterValue(options)).toBe(undefined);
  });

  it('should return default values for compact view as undefined', () => {
    const compact = true;
    const sortOrder = 'ascending';
    const showElapsed = 'false';
    const options = { compact, sortOrder, showElapsed };
    expect(getDateFilterValue(options)).toBe(undefined);
  });

  it('should return string value for feed view when not sort order default', () => {
    const compact = false;
    const sortOrder = 'ascending';
    const showElapsed = 'false';
    const options = { compact, sortOrder, showElapsed };

    const value = 'ascending:false';
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for feed view when show elapsed', () => {
    const compact = false;
    const sortOrder = 'descending';
    const showElapsed = 'true';
    const options = { compact, sortOrder, showElapsed };

    const value = 'descending:true';
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for feed view when multiple non-default values', () => {
    const compact = false;
    const sortOrder = 'ascending';

    const showElapsed = 'true';
    const options = { compact, sortOrder, showElapsed };

    const value = 'ascending:true';
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for compact view when not sort order default', () => {
    const compact = false;
    const sortOrder = 'ascending';
    const showElapsed = 'false';
    const options = { compact, sortOrder, showElapsed };

    const value = 'ascending:false';
    expect(getDateFilterValue(options)).toBe(value);
  });

  it('should return string value for compact view when multiple non-default values', () => {
    const compact = true;
    const sortOrder = 'ascending';

    const showElapsed = 'true';
    const options = { compact, sortOrder, showElapsed };

    const value = 'ascending:true';
    expect(getDateFilterValue(options)).toBe(value);
  });
});
