import { spawnSync } from 'child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts/new-system-nexus-operation.ts');
const ESNO_PATH = path.join(ROOT, 'node_modules/.bin/esno');
const fixtures: string[] = [];

const createFixture = () => {
  const fixture = mkdtempSync(
    path.join(tmpdir(), 'new-system-nexus-operation-'),
  );
  fixtures.push(fixture);

  mkdirSync(path.join(fixture, 'scripts'), { recursive: true });
  mkdirSync(path.join(fixture, 'src/lib/system-nexus-endpoints'), {
    recursive: true,
  });
  cpSync(
    SCRIPT_PATH,
    path.join(fixture, 'scripts/new-system-nexus-operation.ts'),
  );
  writeFileSync(
    path.join(fixture, 'src/lib/system-nexus-endpoints/types.ts'),
    "export type SystemNexusOperationKind = 'signal-with-start-workflow';\n",
  );
  writeFileSync(
    path.join(fixture, 'src/lib/system-nexus-endpoints/index.ts'),
    "import { signalWithStartWorkflow } from './signal-with-start-workflow/definition';\n\nconst OPERATIONS: SystemNexusOperationDefinition[] = [signalWithStartWorkflow];\n",
  );

  return fixture;
};

const runGenerator = (fixture: string, ...args: string[]) =>
  spawnSync(ESNO_PATH, ['scripts/new-system-nexus-operation.ts', ...args], {
    cwd: fixture,
    encoding: 'utf8',
  });

afterEach(() => {
  for (const fixture of fixtures.splice(0))
    rmSync(fixture, { recursive: true });
});

describe('new-system-nexus-operation', () => {
  it.each(['../outside', 'start workflow', "start'workflow", 'start=workflow'])(
    'rejects unsafe kind %j before writing generated files',
    (kind) => {
      const fixture = createFixture();
      const moduleDir = path.join(fixture, 'src/lib/system-nexus-endpoints');
      const typesPath = path.join(moduleDir, 'types.ts');
      const indexPath = path.join(moduleDir, 'index.ts');
      const originalTypes = readFileSync(typesPath, 'utf8');
      const originalIndex = readFileSync(indexPath, 'utf8');

      const result = runGenerator(
        fixture,
        'StartWorkflowExecution',
        '--kind',
        kind,
      );

      expect(result.status).toBe(1);
      expect(existsSync(path.resolve(moduleDir, kind))).toBe(false);
      expect(existsSync(path.join(moduleDir, 'start-workflow-execution'))).toBe(
        false,
      );
      expect(readFileSync(typesPath, 'utf8')).toBe(originalTypes);
      expect(readFileSync(indexPath, 'utf8')).toBe(originalIndex);
    },
  );

  it('rejects an unsafe kind passed with an equals flag', () => {
    const fixture = createFixture();
    const moduleDir = path.join(fixture, 'src/lib/system-nexus-endpoints');
    const typesPath = path.join(moduleDir, 'types.ts');
    const indexPath = path.join(moduleDir, 'index.ts');
    const originalTypes = readFileSync(typesPath, 'utf8');
    const originalIndex = readFileSync(indexPath, 'utf8');

    const result = runGenerator(
      fixture,
      'StartWorkflowExecution',
      '--kind=start=workflow',
    );

    expect(result.status).toBe(1);
    expect(existsSync(path.join(moduleDir, 'start'))).toBe(false);
    expect(readFileSync(typesPath, 'utf8')).toBe(originalTypes);
    expect(readFileSync(indexPath, 'utf8')).toBe(originalIndex);
  });

  it('rejects an unsupported category before writing generated files', () => {
    const fixture = createFixture();
    const moduleDir = path.join(fixture, 'src/lib/system-nexus-endpoints');
    const typesPath = path.join(moduleDir, 'types.ts');
    const indexPath = path.join(moduleDir, 'index.ts');
    const originalTypes = readFileSync(typesPath, 'utf8');
    const originalIndex = readFileSync(indexPath, 'utf8');

    const result = runGenerator(
      fixture,
      'StartWorkflowExecution',
      '--category',
      'invalid-category',
    );

    expect(result.status).toBe(1);
    expect(existsSync(path.join(moduleDir, 'start-workflow-execution'))).toBe(
      false,
    );
    expect(readFileSync(typesPath, 'utf8')).toBe(originalTypes);
    expect(readFileSync(indexPath, 'utf8')).toBe(originalIndex);
  });

  it('accepts valid kind and category inputs', () => {
    const fixture = createFixture();
    const moduleDir = path.join(fixture, 'src/lib/system-nexus-endpoints');

    const result = runGenerator(
      fixture,
      'StartWorkflowExecution',
      '--kind',
      'start-workflow',
      '--category',
      'workflow',
    );

    expect(result.status).toBe(0);
    expect(existsSync(path.join(moduleDir, 'start-workflow'))).toBe(true);
  });
});
