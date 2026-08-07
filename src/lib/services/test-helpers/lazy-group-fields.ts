import type { LazyGroup } from '../grouped-event-buffer';

/**
 * Which LazyGroup fields an EventGroup must agree on. Views filter and sort on
 * one and render the other, so a divergence shows as the wrong rows on screen.
 *
 * The `satisfies` makes TypeScript reject a new field on LazyGroup until it is
 * classified here, so the agreement test that consumes this cannot silently
 * stop being exhaustive. It lives in test-helpers rather than the test itself
 * because src/lib/services/**\/*.test.ts is excluded from `pnpm check`.
 */
export const SHARED_WITH_EVENT_GROUP = {
  id: true,
  eventCount: true,
  initialEvent: true,
  lastEvent: true,
  category: true,
  classification: true,
  finalClassification: true,
  isPending: true,
  pendingActivity: true,
  pendingNexusOperation: true,
  // Buffer bookkeeping — an EventGroup has no counterpart.
  version: false,
} satisfies Record<keyof LazyGroup, boolean>;
