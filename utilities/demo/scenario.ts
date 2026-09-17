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
  /**
   * Where a person can open this run in a browser. Set to the UI the ui stage
   * started when it ran, and the server's bundled UI otherwise. A scenario
   * that hands a step to the reviewer needs this to say where to go.
   */
  uiUrl?: string;
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
  /**
   * Checked before any stage starts, so a scenario can refuse for its own
   * reasons while refusing is still cheap. Without this a missing input
   * surfaces in the scenarios stage, which is after a server build, and a
   * person waits minutes to be told something a string comparison knew.
   *
   * It gets the options and no context: nothing is running yet.
   */
  preflight?: (options: Record<string, unknown>) => Promise<void>;
  run: (
    context: ScenarioContext,
    options: Record<string, unknown>,
  ) => Promise<ScenarioResult>;
};
