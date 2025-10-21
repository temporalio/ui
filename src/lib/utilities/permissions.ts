import type { User } from '$lib/types/global';

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  const permissions = user.temporal_permissions || user.TemporalPermissions;
  if (!permissions) return false;

  // If permissions is "*", user has all permissions
  if (permissions === '*') return true;

  // Split comma-separated permissions and check
  const permissionList = permissions.split(',').map((p) => p.trim());
  return permissionList.includes(permission);
}

/**
 * Check if user can perform a specific workflow action
 */
export function canPerformWorkflowAction(
  user: User | null,
  action: string,
): boolean {
  if (!user) return false;

  const actions =
    user.temporal_workflow_actions || user.TemporalWorkflowActions;

  // If actions is undefined, null, empty string, or "none", deny all actions
  if (!actions || actions === '' || actions.toLowerCase() === 'none')
    return false;

  // If actions is "*", user can perform all actions
  if (actions === '*') return true;

  // Split comma-separated actions and check
  const actionList = actions.split(',').map((a) => a.trim());
  return actionList.includes(action);
}

/**
 * Check if user has write access
 */
export function hasWriteAccess(user: User | null): boolean {
  return (
    hasPermission(user, 'workflow.write') ||
    hasPermission(user, 'namespace.write')
  );
}

/**
 * Check if user has read-only access
 */
export function isReadOnly(user: User | null): boolean {
  if (!user) return true;

  const permissions = user.temporal_permissions || user.TemporalPermissions;
  if (!permissions) return true;

  // If user only has read permissions
  return (
    permissions === 'workflow.read' ||
    permissions === 'namespace.read' ||
    (permissions.includes('read') && !permissions.includes('write'))
  );
}

/**
 * Get list of allowed workflow actions for user
 */
export function getAllowedWorkflowActions(user: User | null): string[] {
  if (!user) return [];

  const actions =
    user.temporal_workflow_actions || user.TemporalWorkflowActions;
  if (!actions) return [];

  if (actions === '*') {
    return ['terminate', 'cancel', 'signal', 'update', 'reset'];
  }

  return actions.split(',').map((a) => a.trim());
}

/**
 * Permission constants
 */
export const PERMISSIONS = {
  WORKFLOW_READ: 'workflow.read',
  WORKFLOW_WRITE: 'workflow.write',
  NAMESPACE_READ: 'namespace.read',
  NAMESPACE_WRITE: 'namespace.write',
  SCHEDULE_READ: 'schedule.read',
  SCHEDULE_WRITE: 'schedule.write',
  BATCH_OPERATIONS: 'batch.operations',
} as const;

/**
 * Check if user can start workflows
 */
export function canStartWorkflow(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.WORKFLOW_WRITE);
}

/**
 * Check if user can modify workflows (generic write actions)
 */
export function canModifyWorkflow(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.WORKFLOW_WRITE);
}

/**
 * Check if user can create/modify schedules
 */
export function canModifySchedule(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.SCHEDULE_WRITE);
}

/**
 * Check if user can perform batch operations
 */
export function canPerformBatchOperations(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.BATCH_OPERATIONS) ||
    hasPermission(user, PERMISSIONS.WORKFLOW_WRITE)
  );
}

/**
 * Check if user can view schedules
 */
export function canViewSchedules(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.SCHEDULE_READ) ||
    hasPermission(user, PERMISSIONS.SCHEDULE_WRITE)
  );
}

/**
 * Check if user can view namespaces
 */
export function canViewNamespaces(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.NAMESPACE_READ) ||
    hasPermission(user, PERMISSIONS.NAMESPACE_WRITE)
  );
}

/**
 * Check if user can create/modify namespaces
 */
export function canModifyNamespace(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.NAMESPACE_WRITE);
}

/**
 * Workflow action constants
 */
export const WORKFLOW_ACTIONS = {
  TERMINATE: 'terminate',
  CANCEL: 'cancel',
  SIGNAL: 'signal',
  UPDATE: 'update',
  RESET: 'reset',
} as const;
