import { createContext } from 'svelte';

import type { WorkflowExecutionChain } from './workflow-execution-chain.svelte';

export const [getWorkflowExecutionChain, setWorkflowExecutionChain] =
  createContext<WorkflowExecutionChain>();
