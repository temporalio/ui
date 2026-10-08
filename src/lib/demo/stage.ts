import type { Definition } from './definition';
import type { Logger } from './paths';
import type { Supervised } from './process';

/**
 * What a stage may hand to the stages after it. A stage reports these rather
 * than assigning to the run's variables, so the run owns its own state and a
 * stage that lives in another repository cannot reach into it.
 */
export type StageHandover = {
  /** The frontend a later stage and the scenario should dial. */
  address?: string;
  /**
   * An address reachable from outside this machine. A Worker that a cloud
   * provider starts needs this, because the provider cannot dial localhost.
   */
  publicAddress?: string;
  /** A UI this stage started, which the summary points a reviewer at. */
  webUrl?: string;
  /** A UI something else shipped, used when no stage started one. */
  bundledUiUrl?: string;
};

export type StageOutput = StageHandover & {
  /** What the summary says about this stage. One line each. */
  details: string[];
  /** Processes to stop when the run ends. */
  processes?: Supervised[];
  /**
   * Ports this stage started listening on, as opposed to ports it reused. The
   * stop path sweeps these as a backstop for a child that outlived its record.
   */
  ownedPorts?: number[];
};

export type StageContext = {
  definition: Definition;
  /** Names the run's working directory and its recorded state. */
  runName: string;
  log: Logger;
} & Required<Pick<StageHandover, 'address'>> &
  Omit<StageHandover, 'address'>;

/**
 * One step of a run, named and switchable. The registry a runner is given
 * decides which stages exist at all, so a repository that embeds this harness
 * contributes its own rather than choosing from a fixed list.
 */
export type DemoStage = {
  name: string;
  /** Whether this definition asks for the stage. `--skip` still wins. */
  enabled: (definition: Definition) => boolean;
  run: (context: StageContext) => Promise<StageOutput>;
  /**
   * What the summary says when the stage did not run. A stage that stands in
   * for something already running uses this to say what it expected.
   */
  idle?: (context: StageContext) => string[];
};

/** The stage that runs the demo itself. Always last, and never skipped away. */
export const SCENARIOS_STAGE = 'scenarios';

export const stageNames = (stages: readonly DemoStage[]): string[] => [
  ...stages.map((stage) => stage.name),
  SCENARIOS_STAGE,
];
