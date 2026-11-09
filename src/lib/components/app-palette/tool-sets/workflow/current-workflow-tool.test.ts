import { beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeWorkflow {
  id: string;
  runId: string;
  isRunning: boolean;
  isPaused?: boolean;
}

const state = vi.hoisted(() => {
  let run: {
    workflow: FakeWorkflow | null;
    metadata?: { definition: { signalDefinitions: { name: string }[] } };
  } = { workflow: null };
  const subscribers = new Set<(value: typeof run) => void>();
  return {
    settings: { disableWriteActions: false },
    pauseEnabled: false,
    writeDisabled: false,
    workflowRun: {
      subscribe(fn: (value: typeof run) => void) {
        subscribers.add(fn);
        fn(run);
        return () => subscribers.delete(fn);
      },
      set(value: typeof run) {
        run = value;
        subscribers.forEach((fn) => fn(run));
      },
    },
  };
});

vi.mock('$app/state', () => ({
  page: {
    get data() {
      return {
        settings: state.settings,
        namespace: {
          namespaceInfo: {
            capabilities: { workflowPause: state.pauseEnabled },
          },
        },
      };
    },
  },
}));

vi.mock('$lib/utilities/core-provider', () => {
  const canWrite = () => !state.writeDisabled;
  return {
    corePermissions: {
      namespaces: {
        canRequestWorkflowCancellation: canWrite,
        canSignalWorkflow: canWrite,
        canTerminateWorkflow: canWrite,
      },
    },
  };
});

vi.mock('$lib/stores/workflow-run', () => ({
  workflowRun: state.workflowRun,
  triggerRefresh: vi.fn(),
}));

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

vi.mock('$lib/services/workflow-service', () => ({
  cancelWorkflow: vi.fn(),
  terminateWorkflow: vi.fn(),
  signalWorkflow: vi.fn(),
}));

import type {
  PaletteContext,
  PaletteSubject,
  PaletteView,
} from '$lib/components/app-palette/types';
import { cancelWorkflow, signalWorkflow } from '$lib/services/workflow-service';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import { currentWorkflowTool } from './current-workflow-tool.svelte';

const tool = currentWorkflowTool(() => 'dev@temporal.io');

function ctx(subject?: PaletteSubject): PaletteContext {
  return {
    push: vi.fn(),
    pop: vi.fn(),
    close: vi.fn(),
    toast: vi.fn(),
    namespace: () => subject?.namespace,
    subject: () => subject,
  };
}

const subject: PaletteSubject = {
  kind: 'workflow',
  namespace: 'ns',
  workflowId: 'order-1',
  runId: 'run-1',
};

function load(isRunning: boolean, isPaused = false) {
  state.workflowRun.set({
    workflow: { id: 'order-1', runId: 'run-1', isRunning, isPaused },
  });
}

function item(id: string, context = ctx(subject)) {
  return tool.items(context).find((entry) => entry.id === id);
}

describe('current workflow tool', () => {
  beforeEach(() => {
    state.settings = { disableWriteActions: false };
    state.pauseEnabled = false;
    state.writeDisabled = false;
    load(true);
  });

  it('shows nothing off a workflow page', () => {
    expect(tool.items(ctx())).toEqual([]);
    expect(tool.items(ctx({ kind: 'namespace', namespace: 'ns' }))).toEqual([]);
  });

  it('lists copy items, download and write actions on a workflow page', () => {
    expect(tool.items(ctx(subject)).map(({ id }) => id)).toEqual([
      'copy-id',
      'copy-run',
      'copy-cli',
      'download',
      'cancel',
      'terminate',
      'signal',
    ]);
  });

  it('enables write actions for a running workflow the user can change', () => {
    expect(item('cancel')?.actions[0].disabled).toBeUndefined();
    expect(item('terminate')?.actions[0].disabled).toBeUndefined();
  });

  it('disables write actions with a reason when the role cannot write', () => {
    state.writeDisabled = true;
    expect(item('cancel')?.actions[0].disabled).toBe(
      'You cannot change workflows in ns',
    );
  });

  it('disables write actions when the namespace turns them off', () => {
    state.settings = { disableWriteActions: true };
    expect(item('terminate')?.actions[0].disabled).toBe(
      'You cannot change workflows in ns',
    );
  });

  it('disables write actions for a closed workflow', () => {
    load(false);
    expect(item('cancel')?.actions[0].disabled).toBe(
      'The workflow is not running',
    );
  });

  it('enables write actions for a paused workflow when the namespace can pause', () => {
    load(false, true);
    state.pauseEnabled = true;
    expect(item('cancel')?.actions[0].disabled).toBeUndefined();
    expect(item('terminate')?.actions[0].disabled).toBeUndefined();
    expect(item('signal')?.actions[0].disabled).toBeUndefined();

    state.pauseEnabled = false;
    expect(item('cancel')?.actions[0].disabled).toBe(
      'The workflow is not running',
    );
  });

  it('treats another run of the workflow in the store as loading', async () => {
    state.workflowRun.set({
      workflow: { id: 'order-1', runId: 'run-0', isRunning: true },
    });
    const context = ctx(subject);
    const cancel = item('cancel', context)?.actions[0];
    expect(cancel?.disabled).toBe('The workflow is still loading');
    expect(item('signal')?.actions[0].disabled).toBe(
      'The workflow is still loading',
    );

    await cancel?.run(context);
    expect(cancelWorkflow).not.toHaveBeenCalledWith(
      expect.objectContaining({
        workflow: expect.objectContaining({ runId: 'run-0' }),
      }),
    );
  });

  it('uses the loaded run when the page names no run', () => {
    const context = ctx({
      kind: 'workflow',
      namespace: 'ns',
      workflowId: 'order-1',
    });
    expect(item('cancel', context)?.actions[0].disabled).toBeUndefined();
  });

  describe('download', () => {
    beforeEach(() => {
      vi.mocked(requestFromAPI).mockReset();
      URL.createObjectURL = vi.fn(() => 'blob:history');
      vi.spyOn(HTMLAnchorElement.prototype, 'click')
        .mockClear()
        .mockImplementation(() => {});
    });

    it('saves every page of the history and reports success', async () => {
      vi.mocked(requestFromAPI)
        .mockResolvedValueOnce({
          history: { events: [{ eventId: '1' }] },
          nextPageToken: 'next',
        })
        .mockResolvedValueOnce({ history: { events: [{ eventId: '2' }] } });
      const context = ctx(subject);
      await item('download', context)?.actions[0].run(context);

      expect(requestFromAPI).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ token: 'next', notifyOnError: false }),
      );
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
      expect(context.toast).toHaveBeenCalledWith(
        'Event history downloaded',
        'success',
      );
    });

    it('reports an error when the history cannot be fetched', async () => {
      vi.mocked(requestFromAPI).mockRejectedValue(new Error('offline'));
      const context = ctx(subject);
      await item('download', context)?.actions[0].run(context);

      expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
      expect(context.toast).toHaveBeenCalledWith(
        'Could not download the event history',
        'error',
      );
      expect(context.toast).not.toHaveBeenCalledWith(
        'Event history downloaded',
        'success',
      );
    });
  });

  it('cancels with the user as the identity', async () => {
    const context = ctx(subject);
    await item('cancel', context)?.actions[0].run(context);
    expect(cancelWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ namespace: 'ns', identity: 'dev@temporal.io' }),
    );
    expect(context.toast).toHaveBeenCalledWith(
      'Cancellation requested',
      'success',
    );
  });

  it('shows the server message when the cancel fails', async () => {
    vi.mocked(cancelWorkflow).mockRejectedValueOnce({
      statusCode: 400,
      statusText: 'Bad Request',
      message: 'workflow execution already completed',
    });
    const context = ctx(subject);
    await item('cancel', context)?.actions[0].run(context);
    expect(context.toast).toHaveBeenCalledWith(
      'workflow execution already completed',
      'error',
    );
    expect(context.toast).not.toHaveBeenCalledWith(
      'Cancellation requested',
      'success',
    );
  });

  describe('signal', () => {
    function signalFlow() {
      const context = ctx(subject);
      const pushed: PaletteView[] = [];
      context.push = (view) => pushed.push(view);
      item('signal', context)?.actions[0].run(context);
      return { context, pushed };
    }

    it('is blocked with a reason when the role cannot write', () => {
      state.writeDisabled = true;
      expect(item('signal')?.actions[0].disabled).toBe(
        'You cannot change workflows in ns',
      );
    });

    it('lists declared signals and offers a typed name', () => {
      state.workflowRun.set({
        workflow: { id: 'order-1', runId: 'run-1', isRunning: true },
        metadata: { definition: { signalDefinitions: [{ name: 'approve' }] } },
      });
      const [names] = signalFlow().pushed;
      expect(names.items().map(({ title }) => title)).toEqual(['approve']);
      expect(names.search?.('approve')).toEqual([]);
      expect(names.search?.('reject').map(({ title }) => title)).toEqual([
        'reject',
      ]);
    });

    it('blocks input that is not JSON and sends valid input', async () => {
      const { context, pushed } = signalFlow();
      const [names] = pushed;
      names.search?.('approve')[0].actions[0].run(context);
      const input = pushed[1];

      expect(input.items()[0].title).toBe('Send approve with no input');
      expect(input.search?.('{oops')[0].disabled).toBe(
        'The input is not valid JSON',
      );

      const [send] = input.search?.('{"ok":true}') ?? [];
      await send.actions[0].run(context);
      expect(signalWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: 'ns',
          name: 'approve',
          input: '{"ok":true}',
          encoding: 'json/plain',
          identity: 'dev@temporal.io',
        }),
      );
      expect(context.toast).toHaveBeenCalledWith(
        'Signal approve sent',
        'success',
      );
    });

    it('shows the server message when the signal fails', async () => {
      vi.mocked(signalWorkflow).mockRejectedValueOnce({
        statusCode: 403,
        statusText: 'Forbidden',
        message: '',
      });
      const { context, pushed } = signalFlow();
      pushed[0].search?.('approve')[0].actions[0].run(context);
      const [send] = pushed[1].items();
      await send.actions[0].run(context);
      expect(context.toast).toHaveBeenCalledWith('Forbidden', 'error');
    });
  });
});
