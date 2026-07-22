export const HISTORY_CTX = Symbol('history-ctx');

export type HistoryContext = {
  /** Unblocks the paused bidirectional fetch cursors. Safe to call multiple times. */
  resume: () => void;
  /** True once the full bidirectional fetch + enrichGroups has completed. */
  readonly fetchComplete: boolean;
  /** Latest ascending event ID seen — live-poll starts from here. */
  readonly latestEventId: number;
  /** Total estimated event count from the descending cursor's first page. */
  readonly totalExpectedEvents: number;
  /** Lowest event ID seen by the descending cursor — drives skeleton gap. */
  readonly descMinId: number;
};
