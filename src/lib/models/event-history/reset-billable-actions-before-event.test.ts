import { describe, expect, it } from 'vitest';

import type { WorkflowEvent } from '$lib/types/events.js';

import { resetBillableActionsBeforeEvent } from './';

describe('resetBillableActionsBeforeEvent', () => {
  const events = [
    {
      id: '1',
      billableActions: 1,
    },
    {
      id: '2',
      billableActions: 1,
    },
    {
      id: '3',
      billableActions: 1,
    },
  ] as WorkflowEvent[];

  it('should not reset billable actions if event id does not exist in events', () => {
    let result = resetBillableActionsBeforeEvent('20', events);
    expect(result[0].billableActions).toEqual(1);
    expect(result[1].billableActions).toEqual(1);
    expect(result[2].billableActions).toEqual(1);

    result = resetBillableActionsBeforeEvent('2', []);
    expect(result).toEqual([]);

    result = resetBillableActionsBeforeEvent('', events);
    expect(result[0].billableActions).toEqual(1);
    expect(result[1].billableActions).toEqual(1);
    expect(result[2].billableActions).toEqual(1);

    result = resetBillableActionsBeforeEvent('1', [events[0]]);
    expect(result[0].billableActions).toEqual(1);
  });

  it('should reset billable actions before the event if events are in ascending order', () => {
    let result = resetBillableActionsBeforeEvent('2', events);
    expect(result[0].billableActions).toEqual(0);
    expect(result[1].billableActions).toEqual(1);
    expect(result[2].billableActions).toEqual(1);

    result = resetBillableActionsBeforeEvent('3', events);
    expect(result[0].billableActions).toEqual(0);
    expect(result[1].billableActions).toEqual(0);
    expect(result[2].billableActions).toEqual(1);

    result = resetBillableActionsBeforeEvent('1', events);
    expect(result[0].billableActions).toEqual(1);
    expect(result[1].billableActions).toEqual(1);
    expect(result[2].billableActions).toEqual(1);
  });

  it('should reset billable actions before the event if events are in decending order', () => {
    let result = resetBillableActionsBeforeEvent('2', events.reverse());
    expect(result[0].billableActions).toEqual(1);
    expect(result[1].billableActions).toEqual(1);
    expect(result[2].billableActions).toEqual(0);

    result = resetBillableActionsBeforeEvent('3', events.reverse());
    expect(result[0].billableActions).toEqual(0);
    expect(result[1].billableActions).toEqual(0);
    expect(result[2].billableActions).toEqual(1);

    result = resetBillableActionsBeforeEvent('1', events.reverse());
    expect(result[0].billableActions).toEqual(1);
    expect(result[1].billableActions).toEqual(1);
    expect(result[2].billableActions).toEqual(1);
  });
});
