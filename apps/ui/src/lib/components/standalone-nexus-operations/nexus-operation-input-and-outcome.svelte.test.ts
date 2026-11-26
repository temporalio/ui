import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import type { Failure } from '$lib/types';

import NexusOperationInputAndOutcome from './nexus-operation-input-and-outcome.svelte';

type Props = {
  isPending?: boolean;
  failure?: Failure;
};

let component: ReturnType<typeof mount> | undefined;

const renderResult = (props: Props) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(NexusOperationInputAndOutcome, { target, props });
  flushSync();
  const resultBlock = target.querySelector(
    '[aria-label="Nexus Operation Result"]',
  );
  return resultBlock?.textContent ?? '';
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('NexusOperationInputAndOutcome', () => {
  it('shows a pending message when the operation is running without a result', () => {
    expect(renderResult({ isPending: true })).toContain(
      'Results will appear upon completion.',
    );
  });

  it('shows null rather than an empty object when a closed operation has no result', () => {
    const text = renderResult({ isPending: false });
    expect(text).toContain('null');
    expect(text).not.toContain('{}');
  });

  it('shows the failure even while pending', () => {
    const text = renderResult({
      isPending: true,
      failure: { message: 'handler exploded' },
    });
    expect(text).toContain('handler exploded');
    expect(text).not.toContain('Results will appear upon completion.');
  });
});
