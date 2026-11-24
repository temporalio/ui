import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { page } from '$app/state';

import { getNexusOperationExecution } from '$lib/services/standalone-nexus-operations';
import type { EventLink } from '$lib/types';
import type { Callback } from '$lib/types/nexus';
import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';

import CallbackBanner from './callback-banner.svelte';

vi.mock('$lib/services/standalone-nexus-operations', () => ({
  getNexusOperationExecution: vi.fn(),
}));

const describeSource = vi.mocked(getNexusOperationExecution);

const sourceExecution = (completionCallbacks: Callback[]) =>
  ({ completionCallbacks }) as unknown as NexusOperationExecution;

const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve));
  flushSync();
};

beforeEach(() => {
  describeSource.mockReset();
  describeSource.mockResolvedValue(sourceExecution([]));
});

const workflowLink = {
  workflow: {
    namespace: 'caller-ns',
    workflowId: 'caller-wf',
    runId: 'caller-run',
  },
} as unknown as EventLink;

const workerCallbackLink = {
  callback: {
    namespace: 'source-ns',
    requestId: 'request-1',
    execution: {
      type: 'EXECUTION_TYPE_NEXUS_OPERATION',
      businessId: 'source-op',
      runId: 'source-run',
    },
  },
} as unknown as EventLink;

const makeCallback = (state: string, links: EventLink[] = []): Callback =>
  ({
    state,
    attempt: 2,
    callback: { links },
  }) as unknown as Callback;

let cleanup: (() => void) | undefined;

const mountBanner = (props: Record<string, unknown>) => {
  page.url = new URL('http://localhost:3000/namespaces/default/workflows');
  page.params = { namespace: 'default' };
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = mount(CallbackBanner, {
    target,
    props: { callbacks: [], ...props } as never,
  });
  cleanup = () => {
    unmount(component);
    target.remove();
  };
  return target;
};

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('CallbackBanner', () => {
  it('renders nothing without callbacks or worker callback links', () => {
    const target = mountBanner({});

    expect(target.querySelector('[data-testid="callback-banner"]')).toBeNull();
  });

  it.each([
    ['Standby', 'Callback is standing by, waiting to be triggered.'],
    ['Succeeded', 'Callback has succeeded.'],
    ['Failed', 'Callback has failed.'],
    ['Blocked', 'Callback is blocked.'],
  ])('titles a single %s callback', (state, title) => {
    const target = mountBanner({ callbacks: [makeCallback(state)] });

    expect(target.textContent).toContain(title);
  });

  it('shows the link, caller namespace, state and attempt for a single Nexus callback', () => {
    const target = mountBanner({
      callbacks: [makeCallback('Succeeded', [workflowLink])],
    });

    const text = target.textContent ?? '';
    expect(text).toContain('Callback Link');
    expect(text).toContain('caller-wf');
    expect(text).toContain('Caller Namespace');
    expect(text).toContain('caller-ns');
    expect(text).toContain('Success');
    expect(text).toContain('Attempt');
  });

  it('falls back to the given link when the callback has no links', () => {
    const target = mountBanner({
      callbacks: [makeCallback('Succeeded')],
      fallbackLink: workflowLink,
    });

    expect(target.textContent).toContain('caller-wf');
  });

  it('links a single worker callback to the source operation callbacks row', () => {
    const target = mountBanner({ workerCallbackLinks: [workerCallbackLink] });

    const link = target.querySelector<HTMLAnchorElement>(
      'a[href*="source-op"]',
    );
    expect(target.textContent).toContain('Callback');
    expect(link?.getAttribute('href')).toContain('requestId=request-1');
    expect(target.textContent).toContain('source-ns');
  });

  it('shows the matched source callback state for a single worker callback', async () => {
    describeSource.mockResolvedValue(
      sourceExecution([
        { requestId: 'request-0', state: 'Failed' } as unknown as Callback,
        {
          requestId: 'request-1',
          state: 'Succeeded',
          attempt: 3,
          lastAttemptCompleteTime: '2026-11-16T12:00:00Z',
        } as unknown as Callback,
      ]),
    );
    const target = mountBanner({ workerCallbackLinks: [workerCallbackLink] });
    await settle();

    const text = target.textContent ?? '';
    expect(describeSource).toHaveBeenCalledOnce();
    expect(describeSource).toHaveBeenCalledWith(
      'source-ns',
      'source-op',
      'source-run',
      false,
    );
    expect(text).toContain('Callback has succeeded.');
    expect(text).toContain('Success');
    expect(text).toContain('Attempt');
    expect(text).toContain('3');
    expect(text).toContain('Last Attempt Completed Time');
    expect(text).toContain('Callback Link');
    expect(text).toContain('source-ns');
  });

  it('keeps the link and caller namespace only when no source callback matches', async () => {
    describeSource.mockResolvedValue(
      sourceExecution([
        { requestId: 'other-request', state: 'Failed' } as unknown as Callback,
      ]),
    );
    const target = mountBanner({ workerCallbackLinks: [workerCallbackLink] });
    await settle();

    const text = target.textContent ?? '';
    expect(text).toContain('Callback Link');
    expect(text).toContain('source-ns');
    expect(text).not.toContain('Callback has failed.');
    expect(text).not.toContain('Attempt');
  });

  it('keeps the link and caller namespace only when the source describe fails', async () => {
    describeSource.mockRejectedValue(new Error('not found'));
    const target = mountBanner({ workerCallbackLinks: [workerCallbackLink] });
    await settle();

    const text = target.textContent ?? '';
    expect(text).toContain('Callback Link');
    expect(text).toContain('source-ns');
    expect(text).not.toContain('Attempt');
  });

  it('does not describe a source operation for an own callback', async () => {
    mountBanner({ callbacks: [makeCallback('Succeeded', [workflowLink])] });
    await settle();

    expect(describeSource).not.toHaveBeenCalled();
  });

  it('shows every state count in the summary, including zeros', () => {
    const target = mountBanner({
      callbacks: [
        makeCallback('Succeeded'),
        makeCallback('Succeeded'),
        makeCallback('Failed'),
      ],
    });

    const rows = [
      ...target.querySelectorAll('[data-testid="callback-state-count"]'),
    ].map((row) => row.textContent?.replace(/\s+/g, ' ').trim());
    expect(target.textContent).toContain('Callback Links ready for review.');
    expect(rows).toEqual([
      'Standing by, awaiting trigger 0',
      'Scheduled 0',
      'Backing off 0',
      'Blocked 0',
      'Completed successfully 2',
      'Failed 1',
    ]);
  });

  it('shows the summary when own callbacks and worker callback links add up to more than one', () => {
    const target = mountBanner({
      callbacks: [makeCallback('Succeeded')],
      workerCallbackLinks: [workerCallbackLink],
    });

    expect(target.textContent).toContain('Callback Links ready for review.');
  });

  it('links the summary to the Links tab with the link count', () => {
    const target = mountBanner({
      callbacks: [makeCallback('Succeeded'), makeCallback('Failed')],
      linksHref: '/links',
      linkCount: 7,
    });

    const link = target.querySelector<HTMLAnchorElement>('a[href="/links"]');
    expect(target.textContent).toContain(
      'Review all Links related to this Workflow Execution',
    );
    expect(link?.textContent?.trim()).toBe('View 7 Links');
  });

  it('falls back to "View Links" without a count', () => {
    const target = mountBanner({
      callbacks: [makeCallback('Succeeded'), makeCallback('Failed')],
      linksHref: '/links',
    });

    expect(target.querySelector('a[href="/links"]')?.textContent?.trim()).toBe(
      'View Links',
    );
  });

  it('leaves out the Links row without a links href', () => {
    const target = mountBanner({
      callbacks: [makeCallback('Succeeded'), makeCallback('Failed')],
    });

    expect(target.textContent).not.toContain('Review all Links');
  });
});
