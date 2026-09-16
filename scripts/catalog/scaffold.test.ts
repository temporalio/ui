import { describe, expect, it } from 'vitest';

import {
  renderDirectoryCatalogScaffold,
  titleFor,
  validateExampleId,
  workflowNameFor,
} from './scaffold';

describe('catalog scaffolding', () => {
  it('accepts dashed lowercase IDs and rejects everything else', () => {
    expect(() => validateExampleId('order-lifecycle')).not.toThrow();
    for (const invalid of [
      'Order',
      'order_lifecycle',
      '-order',
      'order-',
      'order--lifecycle',
      '1order',
      'o',
    ]) {
      expect(() => validateExampleId(invalid)).toThrow(
        'lowercase words separated by single dashes',
      );
    }
  });

  it('rejects IDs already taken by the shared catalog', () => {
    expect(() => validateExampleId('hello')).toThrow(
      'already exists in the shared catalog',
    );
    expect(() => validateExampleId('nexus-greeting')).toThrow(
      'already exists in the shared catalog',
    );
  });

  it('derives workflow names and titles from the example ID', () => {
    expect(workflowNameFor('order-lifecycle')).toBe('orderLifecycle');
    expect(workflowNameFor('ping')).toBe('ping');
    expect(titleFor('order-lifecycle')).toBe('Order lifecycle');
  });

  it('renders optional setup instructions without an empty card', () => {
    const example = renderDirectoryCatalogScaffold({
      exampleId: 'order-lifecycle',
      rootDirectory: process.cwd(),
    }).find(({ path }) => path.endsWith('/example.ts'))?.content;

    expect(example).toContain('setupMarkdown');
    expect(example).toMatch(/\/\/\s*setupMarkdown:/);
    expect(example).not.toMatch(/^\s{2}setupMarkdown:/m);
  });
});
