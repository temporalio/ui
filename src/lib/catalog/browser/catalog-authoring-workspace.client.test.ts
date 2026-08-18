import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeCatalogClientTestRunner,
  getCatalogClientTestRunner,
} from './catalog-client-test-runner';
import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';

describe('CatalogAuthoringWorkspace client interactions', () => {
  let client: Awaited<ReturnType<typeof getCatalogClientTestRunner>>;

  beforeAll(async () => {
    client = await getCatalogClientTestRunner();
  }, catalogHarnessSetupTimeoutMs);

  afterEach(async () => client.cleanup());
  afterAll(closeCatalogClientTestRunner);

  it('exposes returned files as keyboard-selectable tabs with named editors', async () => {
    const target = await client.renderCreate();
    const input = target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    input.value = 'payment-reminder';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();

    const tablist = target.querySelector('[role="tablist"]');
    const tabs = Array.from(
      tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    expect(tablist?.getAttribute('aria-label')).toBe('Example files');
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      'workflow.ts',
      'example.ts',
    ]);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(
      target.querySelector('[aria-label="Edit workflow.ts"]'),
    ).not.toBeNull();

    tabs[0]?.focus();
    tabs[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    client.flushSync();

    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(
      target.querySelector('[aria-label="Edit example.ts"]'),
    ).not.toBeNull();
  });

  it('announces when an edit exists only in the browser buffer', async () => {
    const target = await client.renderCreate();
    const input = target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    input.value = 'payment-reminder';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();

    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "changed";\n',
    );
    await client.flush();

    expect(target.querySelector('[role="status"]')?.textContent).toContain(
      'Unsaved changes',
    );
  });

  it('offers Add, mark for removal, and Restore without rename, folder, or mode controls', async () => {
    const target = await client.renderCreate();
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();

    const button = (label: string) =>
      Array.from(target.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    button('Add file')?.click();
    client.flushSync();
    const pathInput =
      target.querySelector<HTMLInputElement>('#catalog-file-path')!;
    pathInput.value = 'notes.md';
    pathInput.dispatchEvent(new Event('input', { bubbles: true }));
    button('Add')?.click();
    client.flushSync();

    expect(target.textContent).toContain('notes.md');
    button('Add file')?.click();
    client.flushSync();
    const duplicateInput =
      target.querySelector<HTMLInputElement>('#catalog-file-path')!;
    duplicateInput.value = 'workflow.ts';
    duplicateInput.dispatchEvent(new Event('input', { bubbles: true }));
    button('Add')?.click();
    client.flushSync();
    expect(target.textContent).toContain('already exists');

    const exampleTab = Array.from(
      target.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((tab) => tab.textContent?.trim() === 'example.ts')!;
    exampleTab.click();
    client.flushSync();
    const selectedPanel = () =>
      target.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
    Array.from(selectedPanel()?.querySelectorAll('button') ?? [])
      .find((candidate) => candidate.textContent?.trim() === 'Mark for removal')
      ?.click();
    client.flushSync();
    expect(target.textContent).toContain('example.ts is marked for removal');
    Array.from(selectedPanel()?.querySelectorAll('button') ?? [])
      .find((candidate) => candidate.textContent?.trim() === 'Restore')
      ?.click();
    client.flushSync();
    expect(target.textContent).not.toContain(
      'example.ts is marked for removal',
    );

    expect(button('Rename')).toBeUndefined();
    expect(button('New folder')).toBeUndefined();
    expect(target.querySelector('[aria-label="File mode"]')).toBeNull();
  });

  it('warns before discarding a route buffer and resumes the destination only after confirmation', async () => {
    const target = await client.renderCreate();
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    const selectedTab = target.querySelector<HTMLButtonElement>(
      '[role="tab"][aria-selected="true"]',
    )!;
    selectedTab.focus();
    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "changed";\n',
    );

    expect(client.triggerNavigation('/namespaces/default/catalog')).toEqual({
      canceled: true,
    });
    client.flushSync();
    expect(target.textContent).toContain('Unsaved browser edits will be lost');
    expect(target.textContent?.replaceAll(/\s+/g, ' ')).toContain(
      'catalog.local scaffold will remain on disk',
    );
    target
      .querySelector<HTMLButtonElement>('[data-testid="cancel-modal-button"]')
      ?.click();
    client.flushSync();
    expect(document.activeElement).toBe(selectedTab);
    expect(
      target.querySelector('[aria-label="Edit workflow.ts"]')?.textContent,
    ).toContain('changed');
    expect(client.getNavigationCalls()).toEqual([]);

    client.triggerNavigation('/namespaces/default/catalog');
    client.flushSync();
    target
      .querySelector<HTMLButtonElement>('[data-testid="confirm-modal-button"]')
      ?.click();
    await client.flush();
    expect(client.getNavigationCalls()).toEqual([
      '/namespaces/default/catalog',
    ]);
  });

  it('allows navigation without a loss warning after a clean durable Save', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: [],
        generatedOutputs: [],
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();
    await client.flush();

    expect(client.triggerNavigation('/namespaces/default/catalog')).toEqual({
      canceled: false,
    });
    client.flushSync();
    expect(
      target.querySelector<HTMLDialogElement>(
        '#catalog-authoring-leave-warning',
      )?.open,
    ).toBe(false);
  });

  it('submits one complete Save and announces ordered text-labelled progress', async () => {
    const target = await client.renderCreate();
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "changed";\n',
    );
    const save = Array.from(
      target.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.trim() === 'Save')!;

    save.click();
    save.click();
    await client.flush();

    expect(client.getSaveRequests()).toEqual([
      {
        operationId: expect.any(String),
        exampleId: 'payment-reminder',
        baseRevision: 'revision-1',
        files: [
          {
            path: 'workflow.ts',
            content: 'export const workflow = "changed";\n',
          },
          {
            path: 'example.ts',
            content: 'export const example = true;\n',
          },
        ],
      },
    ]);
    expect(save.disabled).toBe(true);
    const log = target.querySelector('[aria-label="Save progress"]');
    expect(
      Array.from(log?.querySelectorAll('li') ?? []).map((item) =>
        item.textContent?.replaceAll(/\s+/g, ' ').trim(),
      ),
    ).toEqual([
      'Write files Passed Files written.',
      'Verify Not reached An earlier check failed.',
    ]);
    expect(log?.getAttribute('aria-live')).toBe('polite');
  });

  it('keeps the browser buffer and focuses a truthful action after a clean rollback', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'failed',
        reason: 'check-failed',
        filesystem: 'restored',
        recovery: 'rolled-back',
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "keep me";\n',
    );
    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();
    await client.flush();

    expect(target.textContent).toContain('Save rolled back');
    expect(target.textContent).not.toContain('Saved and verified');
    expect(
      target.querySelector('[aria-label="Edit workflow.ts"]')?.textContent,
    ).toContain('keep me');
    const retry = Array.from(
      target.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.trim() === 'Retry Save');
    expect(document.activeElement).toBe(retry);
  });

  it('reloads stale files when the Save outcome offers Reload files', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'refused',
        reason: 'stale-revision',
        detail: 'The example changed on disk.',
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "keep me";\n',
    );
    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();
    await client.flush();

    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Reload files')
      ?.click();
    await client.flush();

    expect(client.getLoadedIds()).toEqual([
      'payment-reminder',
      'payment-reminder',
    ]);
  });

  it('inspects the Save operation when recovery needs attention', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'failed',
        reason: 'outcome-unknown',
        filesystem: 'unknown',
        recovery: 'unknown',
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();
    await client.flush();

    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Inspect recovery')
      ?.click();
    await client.flush();

    expect(client.getInspectedOperationIds()).toEqual([
      client.getSaveRequests()[0]?.operationId,
    ]);
    expect(target.textContent).toContain(
      'No recovery operation record is available.',
    );
  });

  it('announces durable success and keeps the next actions reachable', async () => {
    const target = await client.renderCreate({
      exampleHref: '/namespaces/default/catalog/payment-reminder',
      saveOutcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: ['workflow.ts'],
        generatedOutputs: [
          {
            gitEffect: 'ignored-update',
            path: 'catalog.local/registration.ts',
          },
          {
            gitEffect: 'ignored-update',
            path: 'catalog.local/workflows.ts',
          },
          {
            gitEffect: 'ignored-update',
            path: 'catalog.local/catalog.generated.json',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/worker/examples/index.ts',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/worker/workflows.ts',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/browser/catalog.generated.json',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/browser/catalog.generated.ts',
          },
        ],
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "saved";\n',
    );
    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();
    await client.flush();

    expect(target.querySelector('[role="status"]')?.textContent).toContain(
      'Saved and verified',
    );
    expect(
      target.querySelector<HTMLAnchorElement>(
        'a[href="/namespaces/default/catalog/payment-reminder"]',
      )?.textContent,
    ).toContain('Run example');
    expect(target.textContent).toContain('Promote');
    expect(target.textContent).toContain('Keep editing');
    const trackedOutputs = target.querySelector(
      '[aria-label="Tracked generated outputs"]',
    );
    expect(trackedOutputs?.querySelector('h3')?.textContent).toContain(
      'Tracked files updated (4)',
    );
    expect(
      Array.from(trackedOutputs?.querySelectorAll('li') ?? []).map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual([
      'src/lib/catalog/worker/examples/index.ts',
      'src/lib/catalog/worker/workflows.ts',
      'src/lib/catalog/browser/catalog.generated.json',
      'src/lib/catalog/browser/catalog.generated.ts',
    ]);
    const ignoredOutputs = target.querySelector(
      '[aria-label="Ignored generated outputs"]',
    );
    expect(ignoredOutputs?.querySelector('h3')?.textContent).toContain(
      'Ignored local files updated (3)',
    );
    expect(
      Array.from(ignoredOutputs?.querySelectorAll('li') ?? []).map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual([
      'catalog.local/registration.ts',
      'catalog.local/workflows.ts',
      'catalog.local/catalog.generated.json',
    ]);
  });

  it('keeps Promote visible and renders a revision-bound preview only after durable Save', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: ['workflow.ts'],
        generatedOutputs: [],
      },
      promotionPreview: {
        status: 'available',
        exampleId: 'payment-reminder',
        revision: 'revision-2',
        source: {
          id: 'payment-reminder',
          path: 'catalog.local/examples/payment-reminder',
        },
        destination: {
          id: 'payment-reminder',
          path: 'catalog/examples/payment-reminder',
        },
        authoredSource: 'catalog.local/examples/payment-reminder/workflow.ts',
        generatedOutputs: [
          {
            path: 'catalog/catalog.generated.json',
            gitEffect: 'tracked-update',
          },
        ],
        gitEffects: {
          source: 'ignored-removal',
          destination: 'tracked-addition',
        },
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    expect(button('Promote')).not.toBeUndefined();
    expect(target.textContent).toContain(
      'Save all browser changes before promoting.',
    );

    client.replaceEditorContent(
      target,
      'Edit workflow.ts',
      'export const workflow = "saved";\n',
    );
    button('Save')?.click();
    await client.flush();
    button('Promote')?.click();
    await client.flush();

    expect(client.getPromotionPreviewInputs()).toEqual([
      {
        exampleId: 'payment-reminder',
        saveState: { status: 'saved', durability: 'durable' },
      },
    ]);
    expect(target.textContent).toContain(
      'catalog.local/examples/payment-reminder',
    );
    expect(target.textContent).toContain('catalog/examples/payment-reminder');
    expect(target.textContent).toContain('catalog/catalog.generated.json');
    expect(target.textContent).toContain('ignored-removal');
    expect(target.textContent).toContain('tracked-addition');
    expect(button('Confirm promotion')).not.toBeUndefined();
  });

  it('explains that a stale saved revision must be reloaded before Promote', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'refused',
        reason: 'stale-revision',
        detail: 'The example changed on disk.',
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    Array.from(target.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();
    await client.flush();

    expect(target.textContent).toContain(
      'Reload the stale example before promoting.',
    );
  });

  it('dismisses promotion preview without mutation and restores Promote focus', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: [],
        generatedOutputs: [],
      },
      promotionPreview: {
        status: 'available',
        exampleId: 'payment-reminder',
        revision: 'revision-2',
        source: {
          id: 'payment-reminder',
          path: 'catalog.local/payment-reminder',
        },
        destination: {
          id: 'payment-reminder',
          path: 'catalog/payment-reminder',
        },
        authoredSource: 'catalog.local/payment-reminder/workflow.ts',
        generatedOutputs: [],
        gitEffects: {
          source: 'ignored-removal',
          destination: 'tracked-addition',
        },
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    button('Save')?.click();
    await client.flush();
    const promote = button('Promote')!;

    promote.click();
    await client.flush();
    button('Cancel')?.click();
    await client.flush();
    expect(target.querySelector('[aria-label="Promotion preview"]')).toBeNull();
    expect(document.activeElement).toBe(promote);
    expect(client.getPromotionConfirmInputs()).toEqual([]);

    promote.click();
    await client.flush();
    button('Confirm promotion')?.focus();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await client.flush();
    expect(target.querySelector('[aria-label="Promotion preview"]')).toBeNull();
    expect(document.activeElement).toBe(promote);
    expect(client.getPromotionConfirmInputs()).toEqual([]);
  });

  it('discloses every successful promotion change with its confirmed Git effect', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: [],
        generatedOutputs: [],
      },
      promotionPreview: {
        status: 'available',
        exampleId: 'payment-reminder',
        revision: 'revision-2',
        source: {
          id: 'local',
          path: 'catalog.local/examples/payment-reminder',
        },
        destination: {
          id: 'oss',
          path: 'src/lib/catalog/worker/examples/payment-reminder',
        },
        authoredSource: 'catalog.local/examples/payment-reminder',
        generatedOutputs: [
          {
            gitEffect: 'ignored-update',
            path: 'catalog.local/registration.ts',
          },
          {
            gitEffect: 'ignored-update',
            path: 'catalog.local/workflows.ts',
          },
          {
            gitEffect: 'ignored-update',
            path: 'catalog.local/catalog.generated.json',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/worker/examples/index.ts',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/worker/workflows.ts',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/browser/catalog.generated.json',
          },
          {
            gitEffect: 'tracked-update',
            path: 'src/lib/catalog/browser/catalog.generated.ts',
          },
        ],
        gitEffects: {
          source: 'ignored-removal',
          destination: 'tracked-addition',
        },
      },
      promotionOutcome: {
        status: 'succeeded',
        commit: 'durable',
        direction: 'promote',
        result: {
          changedPaths: [
            'catalog.local/examples/payment-reminder',
            'src/lib/catalog/worker/examples/payment-reminder',
            'catalog.local/registration.ts',
            'catalog.local/workflows.ts',
            'catalog.local/catalog.generated.json',
            'src/lib/catalog/worker/examples/index.ts',
            'src/lib/catalog/worker/workflows.ts',
            'src/lib/catalog/browser/catalog.generated.json',
            'src/lib/catalog/browser/catalog.generated.ts',
          ],
          moved: {
            from: 'catalog.local/examples/payment-reminder',
            to: 'src/lib/catalog/worker/examples/payment-reminder',
          },
        },
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    button('Save')?.click();
    await client.flush();
    button('Promote')?.click();
    await client.flush();
    button('Confirm promotion')?.click();
    await client.flush();

    const changes = target.querySelector(
      '[aria-label="Promotion changed paths"]',
    );
    expect(changes?.querySelector('h3')?.textContent).toContain(
      'Changed paths and Git effects (9)',
    );
    expect(
      Array.from(changes?.querySelectorAll('li') ?? []).map((item) =>
        item.textContent?.replaceAll(/\s+/g, ' ').trim(),
      ),
    ).toEqual([
      'catalog.local/examples/payment-reminder — Ignored local directory removed',
      'src/lib/catalog/worker/examples/payment-reminder — Tracked directory added',
      'catalog.local/registration.ts — Ignored local file updated',
      'catalog.local/workflows.ts — Ignored local file updated',
      'catalog.local/catalog.generated.json — Ignored local file updated',
      'src/lib/catalog/worker/examples/index.ts — Tracked file updated',
      'src/lib/catalog/worker/workflows.ts — Tracked file updated',
      'src/lib/catalog/browser/catalog.generated.json — Tracked file updated',
      'src/lib/catalog/browser/catalog.generated.ts — Tracked file updated',
    ]);
  });

  it('confirms the exact preview revision and truthfully expires a stale result', async () => {
    const target = await client.renderCreate({
      saveOutcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: [],
        generatedOutputs: [],
      },
      promotionPreview: {
        status: 'available',
        exampleId: 'payment-reminder',
        revision: 'revision-2',
        source: {
          id: 'payment-reminder',
          path: 'catalog.local/payment-reminder',
        },
        destination: {
          id: 'payment-reminder',
          path: 'catalog/payment-reminder',
        },
        authoredSource: 'catalog.local/payment-reminder/workflow.ts',
        generatedOutputs: [],
        gitEffects: {
          source: 'ignored-removal',
          destination: 'tracked-addition',
        },
      },
      promotionOutcome: {
        status: 'refused',
        direction: 'promote',
        reason: 'stale-preview',
      },
    });
    const createInput =
      target.querySelector<HTMLInputElement>('#catalog-local-id')!;
    createInput.value = 'payment-reminder';
    createInput.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    button('Save')?.click();
    await client.flush();
    button('Promote')?.click();
    await client.flush();
    button('Confirm promotion')?.click();
    await client.flush();

    expect(client.getPromotionConfirmInputs()).toEqual([
      {
        exampleId: 'payment-reminder',
        revision: 'revision-2',
        saveState: { status: 'saved', durability: 'durable' },
      },
    ]);
    expect(target.querySelector('[aria-label="Promotion preview"]')).toBeNull();
    expect(target.textContent).toContain('Promotion preview is stale');
    expect(button('Refresh preview')).not.toBeUndefined();
  });
});
