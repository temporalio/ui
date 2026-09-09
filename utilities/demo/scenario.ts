import type { Logger } from './paths';

export type StartedWorkflow = {
  role: string;
  workflowId: string;
  runId: string;
  note?: string;
  /** Set when the workflow is a catalog example, so the summary can link to it. */
  catalogExampleId?: string;
};

export type ScenarioContext = {
  address: string;
  /**
   * Set when the tunnel stage ran: an address reachable from outside this
   * machine. A scenario whose Workers run in a cloud provider needs this
   * rather than `address`, because the provider cannot dial localhost.
   */
  publicAddress?: string;
  namespace: string;
  log: Logger;
};

export type ScenarioResult = {
  workflows: StartedWorkflow[];
  observations: string[];
  shutdown?: () => Promise<void>;
};

/**
 * Behaviour a scenario cannot express by naming catalog examples. It goes in
 * `scenario.ts` beside the `definition.ts`, the way a catalog example puts its
 * workflow beside its `example.ts`.
 */
export type Scenario = {
  describe: string;
  run: (
    context: ScenarioContext,
    options: Record<string, unknown>,
  ) => Promise<ScenarioResult>;
};
