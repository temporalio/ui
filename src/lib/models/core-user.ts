// Actions an authenticated user can do
// Continue to add to Interface as more actions are added in core
export interface CoreUser {
  namespaceWriteDisabled: (namespace: string) => boolean;
}

// Set context with this key
export const CoreUserKey = 'CoreUser' as const;

export const CoreUserSettings = {
  WORKFLOWS_AUTOREFRESH: 'WORKFLOWS_AUTOREFRESH',
  WORKFLOW_SUMMARY: 'WORKFLOW_SUMMARY',
  WORKFLOW_RELATIONSHIPS: 'WORKFLOW_RELATIONSHIPS',
  WORKFLOW_PENDING_ACTIVITIES: 'WORKFLOW_PENDING_ACTIVITIES',
  WORKFLOW_INPUT_AND_RESULTS: 'WORKFLOW_INPUT_AND_RESULTS',
  WORKFLOW_DECODE_JSON_VIEW: 'WORKFLOW_DECODE_JSON_VIEW',
};

export type CoreUserPages = 'WORKFLOWS' | 'WORKFLOW';

export const CoreUserEmbeddedContent = {
  WORKFLOWS: {
    TOP: 'WORKFLOWS_TOP',
    LEFT: 'WORKFLOWS_LEFT',
    RIGHT: 'WORKFLOWS_RIGHT',
    BOTTOM: 'WORKFLOWS_BOTTOM',
  },
  WORKFLOW: {
    TOP: 'WORKFLOW_TOP',
    LEFT: 'WORKFLOW_LEFT',
    RIGHT: 'WORKFLOW_RIGHT',
    BOTTOM: 'WORKFLOW_BOTTOM',
  },
};

export type UserSettings = Record<
  keyof typeof CoreUserSettings,
  boolean | undefined
>;
