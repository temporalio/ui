import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FilterOrCopyButtons from './filter-or-copy-buttons.svelte';

let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

const render = (props: { filterDisabledTitle?: string }) => {
  const onFilter = vi.fn();
  component = mount(FilterOrCopyButtons, {
    target: document.body,
    props: {
      show: true,
      content: 'value',
      onFilter,
      copyIconTitle: 'Copy',
      copySuccessIconTitle: 'Copied',
      filterIconTitle: 'Filter',
      ...props,
    },
  });
  flushSync();
  const button = document.querySelector<HTMLButtonElement>(
    '[data-testid="quick-filter-button"]',
  )!;
  return { onFilter, button };
};

describe('FilterOrCopyButtons', () => {
  it('filters on click', () => {
    const { onFilter, button } = render({});

    button.click();

    expect(onFilter).toHaveBeenCalledOnce();
    expect(button.getAttribute('aria-disabled')).toBeNull();
  });

  it('does not filter and explains why when the filter is disabled', () => {
    const { onFilter, button } = render({
      filterDisabledTitle: 'Excluded by the query',
    });

    button.click();

    expect(onFilter).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.querySelector('title')?.textContent).toBe(
      'Excluded by the query',
    );
  });
});
