import { describe, expect, it } from 'vitest';

import { parseWithBigInt } from './parse-with-big-int';

describe('parseWithBigInt', () => {
  it('should return parsed number', () => {
    const content = '13939393';
    const parsed = parseWithBigInt(content);
    expect(parsed).toBe(13939393);
  });
  it('should return parsed BigInt', () => {
    const content = '58585858585858585858585';
    const parsed = parseWithBigInt(content);
    expect(parsed).toBe(58585858585858585858585n);
  });
  it('should return parsed decimal', () => {
    const content = '4.552';
    const parsed = parseWithBigInt(content);
    expect(parsed).toBe(4.552);
  });
  it('should return parsed long decimal', () => {
    // We lose precison after 15 digits
    const content = '4.55293882930339339293';
    const parsed = parseWithBigInt(content);
    expect(parsed).toBe(4.552938829303393);
  });
});
