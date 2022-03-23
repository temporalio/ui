import {
  routeForEventHistory,
  routeForStackTrace,
  routeForWorkers,
  routeForWorkflow,
  routeForWorkflowQuery,
  routeForWorkflows,
} from './route-for';

describe('routeFor', () => {
  it('should route to "workflows"', () => {
    const path = routeForWorkflows({ namespace: 'default' });
    expect(path).toBe('/namespaces/default/workflows');
  });

  it('should route to "workflows" endpoint', () => {
    const path = routeForWorkflows({
      namespace: 'default',
      endpoint: 'workflows.json',
    });
    expect(path).toBe('/namespaces/default/workflows/workflows.json');
  });

  it('should route to "workflow"', () => {
    const path = routeForWorkflow({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def');
  });

  it('should route to "workflow" endpoint', () => {
    const path = routeForWorkflow({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      endpoint: 'workflow.json',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/workflow.json');
  });

  it('should default route to "workflow.events" history', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history');
  });

  it('should route to "workflow.events" history endpoint', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      endpoint: 'events.json',
    });
    expect(path).toBe(
      '/namespaces/default/workflows/abc/def/history/events.json',
    );
  });

  it('should route to "workflow.events" summary', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'summary',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/summary');
  });

  it('should route to "workflow.events" compact view', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'compact',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/compact');
  });

  it('should route to "workflow.events" json view', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'json',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/json');
  });

  it('should route to "workflow".stack-trace', () => {
    const path = routeForStackTrace({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/stack-trace');
  });

  it('should route to "workflow".query', () => {
    const path = routeForWorkflowQuery({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/query');
  });

  it('should route to "workers"', () => {
    const path = routeForWorkers({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/workers');
  });
});
