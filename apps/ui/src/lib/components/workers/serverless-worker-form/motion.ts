import { prefersReducedMotion } from 'svelte/motion';

import { tick } from 'svelte';

/**
 * Motion for the Serverless Worker form. Each animation shows a state change
 * the user caused: a reveal grows down from the control they used, and a swap
 * fades in. Nothing above the change moves.
 *
 * Every duration here is 0 when the user prefers reduced motion.
 */
const DURATIONS = {
  /** A block that opens below the control the user used. */
  reveal: 200,
  /** A block that closes. Shorter, so the user does not wait on it. */
  conceal: 150,
  /** Content that replaces content in place. */
  swap: 150,
} as const;

export const motion = (kind: keyof typeof DURATIONS): { duration: number } => ({
  duration: prefersReducedMotion.current ? 0 : DURATIONS[kind],
});

/** How a scroll that brings a field into view moves. */
export const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion.current ? 'instant' : 'smooth';

/**
 * Bring the first problem in a form into view after the next render: an
 * invalid field gets focus, and an error alert is scrolled to. Errors can
 * sit above the viewport on a long form, where the user does not see them.
 */
export const revealFirstProblem = async (
  root: HTMLElement | undefined,
): Promise<void> => {
  await tick();
  const problem = root?.querySelector<HTMLElement>(
    '[aria-invalid="true"], [role="alert"]',
  );
  if (!problem) return;
  problem.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
  if (problem.getAttribute('role') !== 'alert') {
    problem.focus({ preventScroll: true });
  }
};
