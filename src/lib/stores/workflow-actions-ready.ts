import { writable } from 'svelte/store';

// Controls whether WorkflowActions (action buttons + confirmation modals) is
// mounted in the workflow header. Defaults to true so every page except
// fast-history renders actions immediately.
//
// fast-history sets this to false on mount (while the wave animation plays)
// and back to true inside the same setTimeout that sets showTimeline=true,
// so the action buttons appear at the same moment the timeline renders.
export const workflowActionsReady = writable(true);
