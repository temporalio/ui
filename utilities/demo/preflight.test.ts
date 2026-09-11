import { describe, expect, it } from 'vitest';

import { defineScenario } from './definition';
import {
  findMissingCommands,
  impliedCommands,
  requiredCommands,
} from './preflight';

type Input = Parameters<typeof defineScenario>[0];

// name and title are the only required fields, and no case here varies them.
const scenario = (input: Omit<Input, 'name' | 'title'>) =>
  defineScenario({ ...input, name: 'x', title: 'x' });

describe('impliedCommands', () => {
  it('needs ngrok when the tunnel stage is on', () => {
    const d = scenario({ tunnel: { enabled: true } });

    expect(Object.keys(impliedCommands(d))).toContain('ngrok');
  });

  it('needs nothing for a tunnel that is off', () => {
    expect(impliedCommands(scenario({}))).toEqual({});
  });

  it('needs go and git for a workspace build', () => {
    const d = scenario({ server: { source: 'workspace' } });

    expect(Object.keys(impliedCommands(d)).sort()).toEqual(['git', 'go']);
  });

  it('needs neither for a downloaded release', () => {
    expect(impliedCommands(scenario({ server: { source: 'cli' } }))).toEqual(
      {},
    );
  });
});

describe('requiredCommands', () => {
  it('merges what the definition declares with what stages imply', () => {
    const d = scenario({
      tunnel: { enabled: true },
      server: { requires: { commands: ['aws', 'docker'] } },
    });

    expect(Object.keys(requiredCommands(d)).sort()).toEqual([
      'aws',
      'docker',
      'ngrok',
    ]);
  });

  it('gives every command a reason, so a failure is actionable', () => {
    const d = scenario({
      tunnel: { enabled: true },
      server: { requires: { commands: ['aws'] } },
    });

    for (const because of Object.values(requiredCommands(d))) {
      expect(because).toMatch(/\w+/);
    }
  });
});

describe('findMissingCommands', () => {
  it('reports a command that does not exist', async () => {
    const missing = await findMissingCommands({
      'definitely-not-a-real-binary-xyz': 'testing',
    });

    expect(missing).toEqual([
      { command: 'definitely-not-a-real-binary-xyz', because: 'testing' },
    ]);
  });

  it('reports nothing when everything is present', async () => {
    expect(await findMissingCommands({ sh: 'always present' })).toEqual([]);
  });
});
