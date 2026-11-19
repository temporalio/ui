import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';

import type { CardLoad, ChainRun } from './types';

/** A Run card's history controller and load progress. Owned by `CardLoader`. */
export class RunCard {
  controller = $state.raw<WorkflowHistoryController | undefined>();
  loadState = $state.raw<CardLoad | undefined>();
  firstEventSeen = false;
}

/** What `LatestRunFollower` remembers about a Run it followed. */
type RunFollow = { closeHandled: boolean };

/**
 * Everything the chain knows about one Run. `run` and `pendingFetch` are
 * shared; `card` and `follow` each belong to one part of the chain.
 */
export class RunRecord {
  run = $state.raw<ChainRun | null>(null);
  pendingFetch: Promise<ChainRun> | null = null;
  readonly card = new RunCard();
  readonly follow: RunFollow = { closeHandled: false };

  constructor(readonly runId: string) {}
}
