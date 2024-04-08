import type { WorkflowEvent } from '$lib/types/events';

export const getIcon = (event: WorkflowEvent) => {
  switch (event.category) {
    case 'workflow':
      return 'workflow';
    case 'activity':
      return 'temporal-logo';
    case 'signal':
      return 'lightning-bolt';
    case 'marker':
      return 'bookmark';
    case 'timer':
      return 'clock';
    case 'command':
      return 'rocket-ship';
    case 'child-workflow':
      return 'relationship';
    case 'local-activity':
      return 'temporal';
    case 'update':
      return 'merge';
    default:
      return 'temporal';
  }
};

export const getColor = (event: WorkflowEvent) => {
  switch (event.classification) {
    case 'Unspecified':
    case 'Scheduled':
    case 'New':
    case 'Initiated':
      return 'border-gray-400 bg-gray-400';
    case 'Started':
    case 'Open':
      return 'bg-pink-300 border-pink-300';
    case 'Running':
      return 'bg-blue-300 border-blue-300';
    case 'Completed':
      return 'bg-green-400 border-green-300';
    case 'Fired':
    case 'CancelRequested':
      return 'bg-yellow-300 border-yellow-300';
    case 'TimedOut':
    case 'Canceled':
      return 'bg-orange-300 border-orange-300';
    case 'Signaled':
      return 'bg-indigo-300 border-indigo-300';
    case 'Failed':
    case 'Terminated':
      return 'bg-red-300 border-red-300';
    default:
      return 'bg-gray-400 border-gray-400';
  }
};
