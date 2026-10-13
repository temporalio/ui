import postcss from 'postcss';
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import tailwindcss from 'tailwindcss';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { IconAdd, IconChevronDown } from '$lib/io/icon';
import preset from '$lib/theme/preset';

import Button, { type ButtonProps, buttonRecipe } from './button.svelte';

let component: ReturnType<typeof mount> | undefined;

function renderButton(props: ButtonProps) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(Button, { target, props });
  flushSync();
  const button = target.querySelector('button');
  if (!button) throw new Error('Button was not rendered');
  return button;
}

afterEach(async () => {
  if (component) await unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('Button icon-only styling', () => {
  it.each([{ LeadingIcon: IconAdd }, { TrailingIcon: IconChevronDown }])(
    'matches a single icon without a label: %o',
    (icons) => {
      const button = renderButton({ ...icons, 'aria-label': 'Action' });
      expect(button.matches(':has(> svg:only-child)')).toBe(true);
      expect(button.getAttribute('aria-label')).toBe('Action');
      expect(button.querySelector('svg')?.getAttribute('width')).toBe('16');
    },
  );

  it('does not match an icon with a text label', () => {
    const button = renderButton({
      LeadingIcon: IconAdd,
      children: createRawSnippet(() => ({
        render: () => '<span>Create</span>',
      })),
    });
    expect(button.matches(':has(> svg:only-child)')).toBe(false);
    expect(button.children).toHaveLength(2);
    expect(button.textContent?.trim()).toBe('Create');
  });

  it('does not match two icons without a label', () => {
    const button = renderButton({
      LeadingIcon: IconAdd,
      TrailingIcon: IconChevronDown,
      'aria-label': 'Action',
    });
    expect(button.matches(':has(> svg:only-child)')).toBe(false);
  });

  it('retains native disabled behavior for icon-only buttons', () => {
    const onclick = vi.fn();
    const button = renderButton({
      LeadingIcon: IconAdd,
      'aria-label': 'Add',
      disabled: true,
      onclick,
    });
    button.click();
    expect(button.disabled).toBe(true);
    expect(onclick).not.toHaveBeenCalled();
  });

  it('generates square and zero-padding styles on the parent button', async () => {
    const result = await postcss([
      tailwindcss({
        presets: [preset],
        content: [
          { raw: buttonRecipe({ colorScheme: 'primary', size: 'md' }) },
        ],
      }),
    ]).process('@tailwind utilities;', { from: undefined });
    const declarations: Record<string, string> = {};
    result.root.walkRules((rule) => {
      if (!rule.selector.includes(':has(>svg:only-child)')) return;
      rule.walkDecls((declaration) => {
        declarations[declaration.prop] = declaration.value;
      });
    });
    expect(declarations).toMatchObject({
      'aspect-ratio': '1 / 1',
      padding: '0px',
    });
  });
});
