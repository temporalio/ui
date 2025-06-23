// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import type { FormFieldOptions } from './use-form-field.svelte';
import { useFormField } from './use-form-field.svelte';

describe('useFormField', () => {
  it('should return field binding with fallback values when no form context', () => {
    const options: FormFieldOptions = {
      name: 'testField',
      value: 'test value',
      valid: true,
      error: false,
      hintText: 'Test hint',
    };

    const binding = useFormField(options);

    expect(binding).toBeDefined();
    expect(binding.bindableValue).toBeDefined();
    expect(binding.resolvedValid).toBeDefined();
    expect(binding.resolvedError).toBeDefined();
    expect(binding.resolvedHintText).toBeDefined();
    expect(binding.resolvedConstraints).toBeDefined();
    expect(typeof binding.setValue).toBe('function');

    // Test initial values (bindableValue is now a getter, not a store)
    expect(binding.bindableValue).toBe('test value');
    expect(binding.resolvedValid).toBe(true);
    expect(binding.resolvedError).toBe(false);
    expect(binding.resolvedHintText).toBe('Test hint');
    expect(binding.resolvedConstraints).toBe(null);
  });

  it('should handle setValue function correctly', () => {
    const options: FormFieldOptions = {
      name: 'testField',
      value: 'initial',
      valid: true,
      error: false,
      hintText: '',
    };

    const binding = useFormField(options);

    // Test setValue function
    binding.setValue('new value');
    expect(binding.bindableValue).toBe('new value');
  });

  it('should handle empty/undefined values gracefully', () => {
    const options: FormFieldOptions = {
      name: 'testField',
      value: '',
      valid: false,
      error: true,
      hintText: 'Error message',
    };

    const binding = useFormField(options);

    expect(binding.bindableValue).toBe('');
    expect(binding.resolvedValid).toBe(false);
    expect(binding.resolvedError).toBe(true);
    expect(binding.resolvedHintText).toBe('Error message');
  });

  it('should handle value updates through setter', () => {
    const options: FormFieldOptions = {
      name: 'testField',
      value: 'test',
      valid: true,
      error: false,
      hintText: 'hint',
    };

    const binding = useFormField(options);

    // Test setter functionality
    binding.bindableValue = 'updated';
    expect(binding.bindableValue).toBe('updated');
  });
});
