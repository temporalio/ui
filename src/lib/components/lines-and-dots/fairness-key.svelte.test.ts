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
    const alert = target.querySelector<HTMLElement>(
      '[data-testid="fairness-key-alert"]',
    );

    alert?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    client.flush();

    const dialog = target.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain(
      "This Workflow sets a fairness key, but fairness isn't enabled",
    );
    expect(dialog?.querySelector('a')).toBeNull();
  });

  it('keeps the popover open from trigger to CTA and closes it with Escape', () => {
    client.setNamespaceFairness({
      enabled: false,
      enableHref: '/namespaces/default?edit=fairness',
    });
    const target = client.render();
    const trigger = target.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="dialog"]',
    );

    expect(trigger?.getAttribute('aria-label')).toBe(
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
