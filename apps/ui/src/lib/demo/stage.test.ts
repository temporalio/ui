import { describe, expect, it } from 'vitest';

import { defineScenario, listDefinitions } from './definition';
import { type DemoStage, SCENARIOS_STAGE, stageNames } from './stage';

/**
 * Stages a repository other than this one might contribute. Nothing in the
 * core knows these names, which is the point of the registry.
 */
const cloudStages: DemoStage[] = [
  {
    name: 'controlplane',
    enabled: (definition) => definition.scenario.controlplane !== false,
    idle: () => ['Expecting a control plane already running'],
    run: async () => ({ details: ['Control plane up'], ownedPorts: [2002] }),
  },
  {
    name: 'webapp',
    enabled: () => true,
    run: async () => ({
      webUrl: 'http://localhost:3000',
      details: ['Web app up'],
    }),
  },
];

describe('stageNames', () => {
  it('derives the accepted stages from the registry, with scenarios last', () => {
    expect(stageNames(cloudStages)).toEqual([
      'controlplane',
      'webapp',
      SCENARIOS_STAGE,
    ]);
  });

  it('returns only the terminal stage for an empty registry', () => {
    expect(stageNames([])).toEqual([SCENARIOS_STAGE]);
  });
});

describe('a stage decides for itself whether a definition wants it', () => {
  const definition = defineScenario({
    name: 'modal-oauth',
    title: 'Modal OAuth connect flow',
    server: { enabled: false },
    worker: { enabled: false },
    ui: { enabled: false },
    scenario: { controlplane: false },
  });

  it('reads its own switch out of the definition', () => {
    const [controlplane, webapp] = cloudStages;

    expect(controlplane.enabled(definition)).toBe(false);
    expect(webapp.enabled(definition)).toBe(true);
  });

  it('hands the run what it started, rather than assigning to it', async () => {
    const [, webapp] = cloudStages;

    const output = await webapp.run({
      definition,
      runName: definition.name,
      log: () => {},
      address: '127.0.0.1:7233',
    });

    expect(output.webUrl).toBe('http://localhost:3000');
    expect(output.details).toEqual(['Web app up']);
  });
});

describe('listDefinitions', () => {
  it('reports the stages the registry it is given would run', async () => {
    const listed = await listDefinitions(cloudStages);

    expect(listed.length).toBeGreaterThan(0);

    // Every definition in this repository turns these on, because the
    // registry decided so -- none of them mention a control plane.
    for (const definition of listed) {
      expect(definition.stages).toContain('controlplane');
      expect(definition.stages).toContain('webapp');
      expect(definition.stages).not.toContain('server');
    }
  });
});
