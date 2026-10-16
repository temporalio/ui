import { readFile } from 'node:fs/promises';

import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import tailwindcssNesting from 'tailwindcss/nesting';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeFairnessKeyClientTestRunner,
  getFairnessKeyClientTestRunner,
} from './fairness-key-client-test-runner';

async function getCompiledLightLinkStyles() {
  const linkSource = await readFile('src/lib/holocene/link.svelte', 'utf8');
  const styleSource = linkSource.match(
    /<style lang="postcss">(?<css>[\s\S]*)<\/style>/,
  )?.groups?.css;

  if (!styleSource) throw new Error('Expected Link to define PostCSS styles');

  return (
    await postcss([
      autoprefixer(),
      tailwindcssNesting(),
      tailwindcss(),
    ]).process(styleSource, {
      from: 'src/lib/holocene/link.svelte',
    })
  ).css;
}

describe('FairnessKey', () => {
  let client: Awaited<ReturnType<typeof getFairnessKeyClientTestRunner>>;

  beforeAll(async () => {
    client = await getFairnessKeyClientTestRunner();
  });

  afterEach(async () => client.cleanup());
  afterAll(closeFairnessKeyClientTestRunner);

  it.each([
    { enabled: true, fairnessKey: 'payments', hasNumber: false },
    { enabled: undefined, fairnessKey: 'payments-123', hasNumber: true },
  ])(
    'keeps $fairnessKey unchanged when fairness is $enabled',
    ({ enabled, fairnessKey, hasNumber }) => {
      client.setNamespaceFairness({ enabled });
      const target = client.render(fairnessKey);
      const key = target.querySelector<HTMLElement>('div > span');

      expect(target.textContent).toContain(fairnessKey);
      expect(key?.classList.contains('font-mono')).toBe(hasNumber);
      expect(target.querySelector('button')).toBeNull();
      expect(target.querySelector('[role="dialog"]')).toBeNull();
    },
  );

  it.each([
    { fairnessKey: 'payments', hasNumber: false },
    { fairnessKey: 'payments-123', hasNumber: true },
  ])(
    'uses monospace only for the disabled numeric key $fairnessKey',
    ({ fairnessKey, hasNumber }) => {
      client.setNamespaceFairness({ enabled: false });
      const target = client.render(fairnessKey);
      const trigger = target.querySelector<HTMLButtonElement>(
        'button[aria-haspopup="dialog"]',
      );
      const key = trigger?.querySelector<HTMLElement>(':scope > span');
      const icon = trigger?.querySelector<HTMLElement>('[aria-hidden="true"]');
      const srText = trigger?.querySelector<HTMLElement>('.sr-only');

      expect(key?.classList.contains('font-mono')).toBe(hasNumber);
      expect(trigger?.classList).not.toContain('font-mono');
      expect(icon?.classList).not.toContain('font-mono');
      expect(srText?.classList).not.toContain('font-mono');
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

  it('keeps the explanation open after a touch-like pointer exit and click', () => {
    client.setNamespaceFairness({ enabled: false });
    const target = client.render();
    const trigger = target.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="dialog"]',
    );

    trigger?.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    client.flush();
    expect(target.querySelector('[role="dialog"]')).not.toBeNull();

    trigger?.dispatchEvent(
      new MouseEvent('pointerout', { bubbles: true, relatedTarget: null }),
    );
    client.flush();
    expect(target.querySelector('[role="dialog"]')).toBeNull();

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    client.flush();
    expect(document.activeElement).toBe(trigger);
    expect(target.querySelector('[role="dialog"]')).not.toBeNull();
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

  it('announces the fairness key and warning and supports focus, CTA, and Escape', async () => {
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
    expect(cta?.classList).toContain('light');
    expect(cta?.classList).not.toContain('mt-2');
    expect(cta?.parentElement?.classList).toContain('mt-2');
    const lightLinkStyles = await getCompiledLightLinkStyles();
    expect(lightLinkStyles).toMatch(
      /\.link\.light:hover\s*\{\s*color:\s*var\(--color-content-white\)/,
    );
    expect(lightLinkStyles).toMatch(
      /\.link\.light:focus-visible\s*\{\s*color:\s*var\(--color-content-white\)/,
    );
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
