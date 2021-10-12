/// <reference types="@sveltejs/kit" />

interface Window {
  Prism: {
    highlightAll: () => void;
  };
}

type Heroicon = { [key: string]: string }[][];

type WorkflowStatus =
  | 'Running'
  | 'TimedOut'
  | 'Completed'
  | 'Failed'
  | 'Completed'
  | 'ContinuedAsNew'
  | 'Canceled'
  | 'Terminated'
  | null;

type NamespaceScopedRequest = { namespace: string };

type NextPageToken = Uint8Array | string;
type WithNextPageToken = { nextPageToken?: NextPageToken };
type WithoutNextPageToken<T> = Omit<T, keyof WithNextPageToken>;

type PaginationCallbacks<T> = {
  onStart?: () => void;
  onUpdate?: (
    full: WithoutNextPageToken<T>,
    current: WithoutNextPageToken<T>,
  ) => void;
  onComplete?: (finalProps: WithoutNextPageToken<T>) => void;
};

type WorkflowType = string | null;

type WorkflowExecutionFilters = {
  type: WorkflowType;
  status: WorkflowStatus;
};

type EventFormat = 'grid' | 'json';

type ActivityStatus =
  | 'Started'
  | 'Scheduled'
  | 'Completed'
  | 'Failed'
  | 'TimedOut'
  | 'CancelRequested'
  | 'Canceled';

type Activity = {
  id?: string;
  status?: ActivityStatus;
  activityTaskStartedEvent?: ActivityTaskStartedEvent;
  activityTaskScheduledEvent?: ActivityTaskScheduledEvent;
  activityTaskCompletedEvent?: ActivityTaskCompletedEvent;
  activityTaskFailedEvent?: ActivityTaskFailedEvent;
  activityTaskTimedOutEvent?: ActivityTaskTimedOutEvent;
  activityTaskCancelRequestedEvent?: ActivityTaskCancelRequestedEvent;
  activityTaskCanceledEvent?: ActivityTaskCanceledEvent;
};

declare namespace svelte.JSX {
  interface DOMAttributes<T> {
    onclick_outside?: CompositionEventHandler<T>;
  }
}
