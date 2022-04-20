import { toListWorkflowParameters } from './to-list-workflow-parameters';

const executionStatusQuery = 'ExecutionStatus="Completed"';
const workflowIdQuery = 'WorkflowId="Hello"';
const workflowTypeQuery = 'WorkflowType="World"';
const workflowQuery = 'WorkflowId="Hello" and WorkflowType="World"';
const startTimeQuery =
  'StartTime BETWEEN "2022-04-18T17:45:18-06:00" AND "2022-04-20T17:45:18-06:00"';
const combinedQuery =
  'WorkflowId="Hello" and WorkflowType="World" and StartTime BETWEEN "2022-04-18T18:09:49-06:00" AND "2022-04-20T18:09:49-06:00"';

describe(toListWorkflowParameters, () => {
  it('should parse a query with an executionStatus', () => {
    const result = toListWorkflowParameters(executionStatusQuery);

    expect(result).toEqual({ executionStatus: 'Completed' });
  });

  it('should parse a query with an workflowId', () => {
    const result = toListWorkflowParameters(workflowIdQuery);

    expect(result).toEqual({ workflowId: 'Hello' });
  });

  it('should parse a query with an workflowType', () => {
    const result = toListWorkflowParameters(workflowTypeQuery);

    expect(result).toEqual({ workflowType: 'World' });
  });

  it('should parse a query with an workflowType', () => {
    const result = toListWorkflowParameters(workflowQuery);

    expect(result).toEqual({ workflowId: 'Hello', workflowType: 'World' });
  });

  it('should parse a query with an startTime', () => {
    const result = toListWorkflowParameters(startTimeQuery);

    expect(result).toEqual({
      timeRange: '2 days',
    });
  });
});
