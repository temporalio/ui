// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { FormConfig, SPAFormConfig } from './types';

describe('Form Context Types', () => {
  it('should validate SPA form config structure', () => {
    const config: SPAFormConfig = {
      type: 'spa',
      defaultValues: { name: 'test', email: 'test@example.com' },
      onUpdate: async () => {},
    };

    expect(config.type).toBe('spa');
    expect(config.defaultValues).toEqual({
      name: 'test',
      email: 'test@example.com',
    });
    expect(typeof config.onUpdate).toBe('function');
  });

  it('should validate SPA form config with schema', () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
    });

    const config: SPAFormConfig = {
      type: 'spa',
      schema,
      defaultValues: { name: '', email: '' },
      onUpdate: async () => {},
    };

    expect(config.type).toBe('spa');
    expect(config.schema).toBe(schema);
    expect(config.defaultValues).toEqual({ name: '', email: '' });
    expect(typeof config.onUpdate).toBe('function');
  });

  it('should support optional schema in SPA config', () => {
    const configWithoutSchema: SPAFormConfig = {
      type: 'spa',
      defaultValues: { name: 'test' },
      onUpdate: async () => {},
    };

    const configWithSchema: SPAFormConfig = {
      type: 'spa',
      schema: z.object({ name: z.string() }),
      defaultValues: { name: 'test' },
      onUpdate: async () => {},
    };

    expect(configWithoutSchema.schema).toBeUndefined();
    expect(configWithSchema.schema).toBeDefined();
  });

  it('should discriminate form config types correctly', () => {
    const spaConfig: FormConfig = {
      type: 'spa',
      defaultValues: { name: 'test' },
      onUpdate: async () => {},
    };

    expect(spaConfig.type).toBe('spa');

    // Type assertion to verify discriminated union works
    if (spaConfig.type === 'spa') {
      expect(spaConfig.onUpdate).toBeDefined();
      expect(spaConfig.defaultValues).toBeDefined();
    }
  });

  it('should handle complex default values', () => {
    const complexConfig: SPAFormConfig = {
      type: 'spa',
      defaultValues: {
        user: {
          name: 'John',
          email: 'john@example.com',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        settings: {
          language: 'en',
          timezone: 'UTC',
        },
      },
      onUpdate: async () => {},
    };

    const defaultValues = complexConfig.defaultValues as Record<
      string,
      unknown
    >;
    expect((defaultValues.user as Record<string, unknown>).name).toBe('John');
    expect(
      (
        (defaultValues.user as Record<string, unknown>).preferences as Record<
          string,
          unknown
        >
      ).theme,
    ).toBe('dark');
    expect((defaultValues.settings as Record<string, unknown>).language).toBe(
      'en',
    );
  });
});
