import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeFairnessKeyClientTestRunner,
  getFairnessKeyClientTestRunner,
} from './fairness-key-client-test-runner';

describe('FairnessKey', () => {
  let client: Awaited<ReturnType<typeof getFairnessKeyClientTestRunner>>;

  beforeAll(async () => {
    client = await getFairnessKeyClientTestRunner();
  });

  afterEach(async () => client.cleanup());
  afterAll(closeFairnessKeyClientTestRunner);

  it.each([{ enabled: true }, { enabled: undefined }])(
    'keeps the value unchanged when fairness is $enabled',
    ({ enabled }) => {
      client.setNamespaceFairness({ enabled });
      const target = client.render();

      expect(target.textContent).toContain('payments');
      expect(target.querySelector('button')).toBeNull();
      expect(target.querySelector('[role="dialog"]')).toBeNull();
    },
  );

  it('opens the no-CTA explanation on hover when fairness is disabled', () => {
    client.setNamespaceFairness({ enabled: false });
    const target = client.render();
    const trigger = target.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="dialog"]',
    );

    trigger?.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    client.flush();

    const dialog = target.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain(
      "This Workflow sets a fairness key, but fairness isn't enabled",
    );
    expect(dialog?.querySelector('a')).toBeNull();
  });

  it('keeps the popover open while the pointer moves to the CTA', () => {
    client.setNamespaceFairness({
      enabled: false,
      enableHref: '/namespaces/default?edit=fairness',
    });
    const target = client.render();
    const trigger = target.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="dialog"]',
    );

    trigger?.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    client.flush();

    const dialog = target.querySelector<HTMLElement>('[role="dialog"]');
    const bridge = target.querySelector<HTMLElement>(
      '[data-testid="fairness-key-popover-bridge"]',
    );
    expect(dialog).not.toBeNull();
    expect(bridge?.classList).toContain('pt-2');
    expect(dialog?.classList).not.toContain('mt-2');

    trigger?.dispatchEvent(
      new MouseEvent('pointerout', { bubbles: true, relatedTarget: bridge }),
    );
    bridge?.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: trigger }),
    );
    client.flush();
    expect(target.querySelector('[role="dialog"]')).not.toBeNull();

    bridge?.dispatchEvent(
      new MouseEvent('pointerout', {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    client.flush();
    expect(target.querySelector('[role="dialog"]')).toBeNull();
  });

  it('announces the fairness key and warning and supports focus, CTA, and Escape', () => {
    client.setNamespaceFairness({
      enabled: false,
      enableHref: '/namespaces/default?edit=fairness',
    });
    const target = client.render();
    const trigger = target.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="dialog"]',
    );

    expect(trigger?.getAttribute('aria-label')).toBeNull();
    expect(trigger?.textContent).toContain('payments');
    expect(trigger?.textContent).toContain(
      'Fairness is disabled for this Namespace',
    );
    trigger?.focus();
    client.flush();

    const dialog = target.querySelector<HTMLElement>('[role="dialog"]');
    const cta = dialog?.querySelector<HTMLAnchorElement>('a');
    expect(dialog).not.toBeNull();
    expect(cta?.getAttribute('href')).toBe('/namespaces/default?edit=fairness');
    cta?.focus();
    expect(document.activeElement).toBe(cta);

    trigger?.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: cta }),
    );
    cta?.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, relatedTarget: trigger }),
    );
    client.flush();
    expect(target.querySelector('[role="dialog"]')).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    client.flush();
    expect(target.querySelector('[role="dialog"]')).toBeNull();
  });
});
