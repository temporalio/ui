import { describe, expect, it } from 'vitest';

import { getTruncatedWord } from './get-truncated-word';

describe('getTruncatedWord', () => {
  it('should return same word if the width is wider than word', () => {
    expect(getTruncatedWord('Running', 100)).toBe('Running');
  });
  it('should return truncated word if the width is shorter than word', () => {
    expect(getTruncatedWord('Running', 50)).toBe('Ru...');
  });
  it('should return "..." if the width is zero', () => {
    expect(getTruncatedWord('Running', 0)).toBe('...');
  });
});
