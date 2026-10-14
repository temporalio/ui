import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';
import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

import { MOCK_NEXUS_OPERATION } from '../../../tests/test-utilities/mocks/nexus-operations';

import StandaloneNexusOperationDetails from './standalone-nexus-operation-details.svelte';

let component: ReturnType<typeof mount> | undefined;

const renderDetails = (info: Record<string, unknown> = {}) => {
  nexusOperationExecution.set({
    ...MOCK_NEXUS_OPERATION,
    info: { ...MOCK_NEXUS_OPERATION.info, ...info },
  } as unknown as NexusOperationExecution);
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(StandaloneNexusOperationDetails, {
    target,
    props: { namespace: 'default' },
  });
  flushSync();
  return target;
};

const startAttempts = (target: HTMLElement) =>
  target.querySelector('[aria-label="Start Attempts"]');

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  nexusOperationExecution.set(undefined);
  document.body.innerHTML = '';
});

describe('StandaloneNexusOperationDetails start attempts', () => {
  it('shows the start attempts section on the first attempt', () => {
    const section = startAttempts(renderDetails({ attempt: 1 }));
    expect(section).not.toBeNull();
    expect(section?.textContent).toContain('Start Attempts');
    expect(section?.textContent).toContain('1');
  });

  it('shows the operation state as a badge', () => {
    const section = startAttempts(
      renderDetails({ state: 'PENDING_NEXUS_OPERATION_STATE_SCHEDULED' }),
    );
    expect(section?.textContent).toContain('Scheduled');
  });

  it.each(['', 'PENDING_NEXUS_OPERATION_STATE_UNSPECIFIED'])(
    'hides the state badge when the state is %j',
    (state) => {
      const section = startAttempts(renderDetails({ attempt: 1, state }));
      const attempts = section?.querySelector('dd');
      expect(attempts?.textContent?.trim()).toBe('1');
      expect(attempts?.children).toHaveLength(1);
    },
  );

  it('places start attempts between run details and operation details', () => {
    const headings = Array.from(renderDetails().querySelectorAll('h5')).map(
      (heading) => heading.textContent?.trim(),
    );
    const runDetails = headings.indexOf('Run Details');
    const attempts = headings.indexOf('Start Attempts');
    const operationDetails = headings.indexOf('Operation Details');
    expect(runDetails).toBeLessThan(attempts);
    expect(attempts).toBeLessThan(operationDetails);
  });
});
