// @vitest-environment jsdom
import { get } from 'svelte/store';

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

    // Test initial values
    expect(get(binding.bindableValue)).toBe('test value');
    expect(get(binding.resolvedValid)).toBe(true);
    expect(get(binding.resolvedError)).toBe(false);
    expect(get(binding.resolvedHintText)).toBe('Test hint');
    expect(get(binding.resolvedConstraints)).toBe(null);
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
    expect(get(binding.bindableValue)).toBe('new value');
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

    expect(get(binding.bindableValue)).toBe('');
    expect(get(binding.resolvedValid)).toBe(false);
    expect(get(binding.resolvedError)).toBe(true);
    expect(get(binding.resolvedHintText)).toBe('Error message');
  });

  it('should create writable stores that can be subscribed to', () => {
    const options: FormFieldOptions = {
      name: 'testField',
      value: 'test',
      valid: true,
      error: false,
      hintText: 'hint',
    };

    const binding = useFormField(options);

    let valueUpdated = false;
    const unsubscribe = binding.bindableValue.subscribe((value) => {
      if (value === 'updated') {
        valueUpdated = true;
      }
    });

    binding.setValue('updated');
    expect(valueUpdated).toBe(true);

    unsubscribe();
  });
});
