// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import type { Snippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { SPAFormConfig } from './types';

import Form from './form.svelte';

describe('Form', () => {
  const mockConfig: SPAFormConfig = {
    type: 'spa',
    defaultValues: { name: 'test' },
    onUpdate: async () => {},
  };

  it('should render a form element', () => {
    const { container } = render(Form, {
      props: {
        config: mockConfig,
        children: (() => {}) as unknown as Snippet<[]>,
      },
    });

    const formElement = container.querySelector('form');
    expect(formElement).not.toBeNull();
  });

  it('should accept config prop', () => {
    const { component } = render(Form, {
      props: {
        config: mockConfig,
        children: (() => {}) as unknown as Snippet<[]>,
      },
    });

    expect(component).toBeTruthy();
  });

  it('should render with schema validation config', () => {
    const schemaConfig: SPAFormConfig = {
      type: 'spa',
      schema: z.object({ name: z.string() }),
      defaultValues: { name: 'test' },
      onUpdate: async () => {},
    };

    const { container } = render(Form, {
      props: {
        config: schemaConfig,
        children: (() => {}) as unknown as Snippet<[]>,
      },
    });

    const formElement = container.querySelector('form');
    expect(formElement).not.toBeNull();
  });
});
