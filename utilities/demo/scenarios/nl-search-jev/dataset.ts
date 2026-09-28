import type { Outcome } from './workflows';

export type DemoWorkflowType =
  | 'AgentSessionWorkflow'
  | 'OrderWorkflow'
  | 'RefundWorkflow';

export type DemoWorkflow = {
  workflowId: string;
  workflowType: DemoWorkflowType;
  outcome: Outcome;
  customerTier: 'gold' | 'silver' | 'bronze';
  attempts: number;
};

/**
 * A fixed set of workflows, so every demo run searches the same data and each
 * search in the definition's review steps has one right answer.
 */
export const DATASET: DemoWorkflow[] = [
  {
    workflowId: 'agent-session-001',
    workflowType: 'AgentSessionWorkflow',
    outcome: 'run',
    customerTier: 'gold',
    attempts: 1,
  },
  {
    workflowId: 'agent-session-002',
    workflowType: 'AgentSessionWorkflow',
    outcome: 'complete',
    customerTier: 'silver',
    attempts: 2,
  },
  {
    workflowId: 'agent-session-003',
    workflowType: 'AgentSessionWorkflow',
    outcome: 'fail',
    customerTier: 'gold',
    attempts: 5,
  },
  {
    workflowId: 'agent-planner-004',
    workflowType: 'AgentSessionWorkflow',
    outcome: 'complete',
    customerTier: 'bronze',
    attempts: 1,
  },
  {
    workflowId: 'order-1001',
    workflowType: 'OrderWorkflow',
    outcome: 'complete',
    customerTier: 'gold',
    attempts: 1,
  },
  {
    workflowId: 'order-1002',
    workflowType: 'OrderWorkflow',
    outcome: 'fail',
    customerTier: 'silver',
    attempts: 4,
  },
  {
    workflowId: 'order-1003',
    workflowType: 'OrderWorkflow',
    outcome: 'run',
    customerTier: 'gold',
    attempts: 3,
  },
  {
    workflowId: 'order-1004',
    workflowType: 'OrderWorkflow',
    outcome: 'complete',
    customerTier: 'bronze',
    attempts: 7,
  },
  {
    workflowId: 'refund-2001',
    workflowType: 'RefundWorkflow',
    outcome: 'fail',
    customerTier: 'gold',
    attempts: 2,
  },
  {
    workflowId: 'refund-2002',
    workflowType: 'RefundWorkflow',
    outcome: 'complete',
    customerTier: 'silver',
    attempts: 6,
  },
  {
    workflowId: 'refund-2003',
    workflowType: 'RefundWorkflow',
    outcome: 'run',
    customerTier: 'silver',
    attempts: 3,
  },
];

/**
 * The searches the demo shows, with the filters each must produce against
 * DATASET. The review steps and the recording both read this list.
 */
export const DEMO_SEARCHES = [
  {
    text: 'workflow id starts with agent',
    expect: 'WorkflowId STARTS_WITH "agent": the four agent-* workflows',
  },
  {
    text: 'failed order workflows',
    expect:
      'ExecutionStatus = Failed and WorkflowType = OrderWorkflow: order-1002',
  },
  {
    text: 'gold tier workflows with more than 3 attempts',
    expect: 'CustomerTier = gold and Attempts > 3: agent-session-003',
  },
  {
    text: 'running workflows that are not gold tier',
    expect: 'ExecutionStatus = Running and CustomerTier != gold: refund-2003',
  },
] as const;
