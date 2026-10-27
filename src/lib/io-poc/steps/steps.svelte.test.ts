import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import Steps from './steps.svelte';

let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

const mountSteps = (props: Record<string, unknown> = {}) => {
  const target = document.body.appendChild(document.createElement('div'));
  component = mount(Steps, {
    target,
    props: {
      items: [
        { title: 'Details' },
        { title: 'Retention' },
        { title: 'Review' },
      ],
      step: 1,
      showControls: false,
      ...props,
    },
  });
  flushSync();
  return [...target.querySelectorAll('[data-part="trigger"]')];
};

describe('Steps', () => {
  it('announces completed steps in text, not only with the check mark', () => {
    const [completed, current, upcoming] = mountSteps();

    expect(completed.textContent).toContain('Completed');
    expect(current.textContent).not.toContain('Completed');
    expect(upcoming.textContent).not.toContain('Completed');
  });

  it('uses the translated completed label', () => {
    const [completed] = mountSteps({ completedLabel: 'Abgeschlossen' });

    expect(completed.textContent).toContain('Abgeschlossen');
  });
});
