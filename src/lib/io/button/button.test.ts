import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import IconAdd from '$lib/io/icon/icons/add.svelte';

import Button, { type ButtonProps } from './button.svelte';

const children = createRawSnippet(() => ({
  render: () => '<span>Button</span>',
}));
const cleanup: (() => Promise<void>)[] = [];

function renderButton(props: ButtonProps) {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Button, { target, props });
  flushSync();
  cleanup.push(async () => {
    await unmount(component);
    target.remove();
  });
  const button = target.querySelector('button');
  if (!button) throw new Error('Button did not render');
  return button;
}

afterEach(async () => {
  for (const dispose of cleanup.splice(0)) await dispose();
});

describe('IO Button', () => {
  it('renders a native non-submitting button and its label', () => {
    const button = renderButton({ children });
    expect(button.type).toBe('button');
    expect(button.textContent?.trim()).toBe('Button');
    expect(button.classList.contains('bg-interactive-primary')).toBe(true);
    expect(button.classList.contains('text-base')).toBe(true);
  });

  it('forwards native attributes and click events', () => {
    const onclick = vi.fn();
    const button = renderButton({
      children,
      type: 'submit',
      name: 'action',
      value: 'save',
      onclick,
      'aria-pressed': true,
    });
    button.click();
    expect(onclick).toHaveBeenCalledOnce();
    expect(button.type).toBe('submit');
    expect(button.name).toBe('action');
    expect(button.value).toBe('save');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('uses native disabled behavior', () => {
    const onclick = vi.fn();
    const button = renderButton({ children, disabled: true, onclick });
    button.click();
    expect(button.disabled).toBe(true);
    expect(onclick).not.toHaveBeenCalled();
  });

  it.each(['xs', 'sm', 'md'] satisfies ButtonProps['size'][])(
    'sizes decorative icons for %s buttons',
    (size) => {
      const button = renderButton({
        children,
        size,
        LeadingIcon: IconAdd,
        TrailingIcon: IconAdd,
      });
      const icons = button.querySelectorAll('svg');
      expect(icons).toHaveLength(2);
      for (const icon of icons) {
        expect(icon.getAttribute('width')).toBe(size === 'md' ? '16' : '12');
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      }
    },
  );

  it('renders a named icon-only button', () => {
    const button = renderButton({
      variant: 'icon',
      Icon: IconAdd,
      'aria-label': 'Add',
    });
    expect(button.getAttribute('aria-label')).toBe('Add');
    expect(button.querySelectorAll('svg')).toHaveLength(1);
    expect(button.classList.contains('p-2')).toBe(true);
    expect(button.classList.contains('px-3')).toBe(false);
  });

  it('renders the trailing element inline after the label', () => {
    const trailingElement = createRawSnippet(() => ({
      render: () => '<span>0</span>',
    }));
    const button = renderButton({ children, trailingElement });
    expect(
      Array.from(button.querySelectorAll('span'), (span) => span.textContent),
    ).toEqual(['Button', '0']);
  });

  it.each([
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ] satisfies ButtonProps['colorScheme'][])(
    'supports the %s color scheme',
    (colorScheme) => {
      const button = renderButton({ children, colorScheme });
      expect(button.className).toContain('enabled:hover:bg-');
      expect(button.className).toContain('enabled:active:bg-');
      expect(button.className).toContain('focus-visible:ring-indigo-9');
    },
  );

  it('merges caller classes last', () => {
    const button = renderButton({ children, class: 'px-6' });
    expect(button.classList.contains('px-6')).toBe(true);
    expect(button.classList.contains('px-3')).toBe(false);
  });
});
