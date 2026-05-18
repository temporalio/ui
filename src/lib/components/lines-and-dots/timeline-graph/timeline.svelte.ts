import type { EventGroups } from '$lib/models/event-groups/event-groups';
import type { WorkflowExecution } from '$lib/types/workflows';

import { Timespan, type TimespanLike } from './timespan';

export class Timeline {
  readonly viewportTimespan: Timespan;
  viewportDimensions: { widthPx: number; heightPx: number };

  workflow: WorkflowExecution;
  eventGroups: EventGroups;

  constructor({
    workflow,
    eventGroups,
    timespan,
  }: {
    workflow: WorkflowExecution;
    eventGroups: EventGroups;
    timespan: TimespanLike;
  }) {
    this.workflow = workflow;
    this.eventGroups = eventGroups;
    this.viewportTimespan = Timespan.coerce(timespan);
  }
}
