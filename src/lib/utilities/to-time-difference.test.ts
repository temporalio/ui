import { describe, expect, it } from 'vitest';

import { toTimeDifference } from './to-time-difference';

describe('toTimeDifference', () => {
  const negativeDefault = 'None';

  it('should correctly parse a Timestamp', () => {
    const now = 1649867374630;
    const date = '2022-04-13T16:29:35.630571Z';
    expect(toTimeDifference({ date, now, negativeDefault })).toEqual('1s');
  });

  it('should correctly parse a negative difference', () => {
    const now = 1683060815883;
    const date = '2022-04-13T16:29:35.630571Z';
    expect(toTimeDifference({ date, now })).toEqual('-33193440.253s');
  });

  it('should correctly parse a negative difference with a default', () => {
    const now = 1683060815883;
    const date = '2022-04-13T16:29:35.630571Z';
    expect(toTimeDifference({ date, now, negativeDefault })).toEqual('None');
  });

  it('should correctly parse an invalid date', () => {
    expect(toTimeDifference({ date: null })).toEqual('');
    expect(toTimeDifference({ date: '' })).toEqual('');
    expect(toTimeDifference({ date: undefined })).toEqual('');
    expect(toTimeDifference({ date: 'date' })).toEqual('');
  });
});
