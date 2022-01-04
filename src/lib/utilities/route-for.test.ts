import { routeFor } from './route-for';

describe(routeFor, () => {
  it('should route to "workflows"', () => {
    const path = routeFor('workflows', { namespace: 'default' });
    expect(path).toBe('/namespaces/default/workflows');
  });

  it('should route to "workflow"', () => {
    const path = routeFor('workflow', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def');
  });

  it('should route to "workflow.events"', () => {
    const path = routeFor('workflow.events', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history');
  });

  it('should route to "workflow".events.full', () => {
    const path = routeFor('workflow.events.full', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/full');
  });

  it('should route to "workflow".events.full.event', () => {
    const path = routeFor('workflow.events.full.event', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
      eventId: '1',
    });
    expect(path).toBe(
      '/namespaces/default/workflows/abc/def/history/full/event-1',
    );
  });

  it('should route to "workflow".events.full.pending', () => {
    const path = routeFor('workflow.events.full.pending', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
      eventId: '1',
    });
    expect(path).toBe(
      '/namespaces/default/workflows/abc/def/history/full/pending-1',
    );
  });

  it('should route to "workflow".events.compact', () => {
    const path = routeFor('workflow.events.compact', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/compact');
  });

  it('should route to "workflow".events.compact.activity', () => {
    const path = routeFor('workflow.events.compact.activity', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
      eventId: '1',
    });
    expect(path).toBe(
      '/namespaces/default/workflows/abc/def/history/compact/activity-1',
    );
  });

  it('should route to "workflow".events.json', () => {
    const path = routeFor('workflow.events.json', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/json');
  });

  it('should route to "workflow".stack-trace', () => {
    const path = routeFor('workflow.stack-trace', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/stack-trace');
  });

  it('should route to "workflow".query', () => {
    const path = routeFor('workflow.query', {
      namespace: 'default',
      workflowId: 'abc',
      runId: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/query');
  });

  it('should route to "workers"', () => {
    const path = routeFor('workers', {
      namespace: 'default',
      queue: 'rainbow-statuses',
    });
    expect(path).toBe('/namespaces/default/workers/rainbow-statuses');
  });
});
