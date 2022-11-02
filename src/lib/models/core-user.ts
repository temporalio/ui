// Actions an authenticated user can do
// Continue to add to Interface as more actions are added in core
export interface CoreUser {
  terminateDisabled: (namespace: string) => boolean;
  scheduleWriteDisabled: (namespace: string) => boolean;
}

// Set context with this key
export const CoreUserKey = 'CoreUser' as const;
