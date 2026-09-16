import { describe, expect, it } from 'vitest';

import { colorTheme } from './tailwind-colors';

describe('Tailwind color theme', () => {
  it('uses the primary border token as the default border color', () => {
    expect(colorTheme.borderColor.DEFAULT).toBe('var(--color-border-primary)');
  });
});
