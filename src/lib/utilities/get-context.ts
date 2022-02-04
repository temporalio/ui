import type { WorkflowExecution } from '$lib/models/workflow-execution';
import type { Refreshable } from '$lib/stores/refreshable';
import type { DescribeNamespaceResponse } from '$types';
import { getContext } from 'svelte';

export function getAppContext(key: 'workflow'): Refreshable<WorkflowExecution>;
export function getAppContext(key: 'group'): boolean;
export function getAppContext(key: 'namespaces'): DescribeNamespaceResponse[];
export function getAppContext(key: 'events'): EventualHistoryEvents;

export function getAppContext(key: string): unknown {
  return getContext(key);
}
