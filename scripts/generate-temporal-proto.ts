import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import yargs from 'yargs/yargs';

import { getProjectRoot } from './get-project-root';

const require = createRequire(import.meta.url);
const projectRoot = getProjectRoot();
const packageRoot = join(projectRoot, 'vendor', 'temporalio-proto');
const outputDir = join(packageRoot, 'protos');
const cacheDir = join(projectRoot, '.proto-cache');
const apiCheckoutDir = join(cacheDir, 'api');

const REPO = 'temporalio/api';
const DEFAULT_REF = 'main';

// The generated output (vendor/temporalio-proto) is local-only and gitignored, so
// the feature never merges to main relying on an unreleased proto. The override
// that activates it, and the server/go.mod bump, are applied to the working tree
// at generate time and are NOT committed; `--reset` undoes all of it.
const packageJsonPath = join(projectRoot, 'package.json');
const overrideName = '@temporalio/proto';
const overrideSpec = 'file:./vendor/temporalio-proto';

const argv = yargs(process.argv.slice(2))
  .scriptName('generate:proto')
  .usage(
    '$0 [options]',
    'Generate the local (gitignored) @temporalio/proto types from temporalio/api protos.',
  )
  .option('ref', {
    type: 'string',
    describe:
      'temporalio/api ref to generate from — a branch, tag, or commit SHA (default: main)',
  })
  .option('sync-ui-server', {
    type: 'boolean',
    describe:
      'Also bump server/go.mod go.temporal.io/api and rebuild the ui-server so its wire format matches the generated types',
  })
  .option('ui-server-version', {
    type: 'string',
    describe:
      'go.temporal.io/api version for --sync-ui-server (default: latest; a git commit and a go tag are different axes, so latest is the practical match for main)',
  })
  .option('reset', {
    type: 'boolean',
    describe:
      'Undo local setup: remove the @temporalio/proto override, delete the generated vendor output, revert server/go.mod, and reinstall',
  })
  .conflicts('reset', ['ref', 'sync-ui-server', 'ui-server-version'])
  .implies('ui-server-version', 'sync-ui-server')
  .example('$0', 'Generate from the latest temporalio/api main')
  .example(
    '$0 --ref v1.63.3',
    'Generate from a specific tag, branch, or commit',
  )
  .example(
    '$0 --sync-ui-server',
    'Generate and bump + rebuild the ui-server to match',
  )
  .example(
    '$0 --reset',
    'Undo local setup and return to a clean, main-matching state',
  )
  .strict()
  .help()
  .parseSync();

const ref = argv.ref ?? DEFAULT_REF;
const syncUiServer = argv.syncUiServer;
const uiServerVersion = argv.uiServerVersion ?? 'latest';
const reset = argv.reset;

const log = (message: string): void => {
  console.log(`[generate:proto] ${message}`);
};

const run = (command: string, commandArgs: string[], cwd?: string): string => {
  return execFileSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 1024 * 1024 * 256,
  });
};

// Resolve a branch/tag ref to its current commit SHA. A ref that is already a
// full SHA (git ls-remote finds nothing for it) is returned as-is.
const resolveCommit = (repo: string, refName: string): string => {
  const output = run('git', [
    'ls-remote',
    `https://github.com/${repo}`,
    refName,
  ]);
  const sha = output.split('\t')[0]?.trim();
  return sha || refName;
};

const fetchApiRepoAtCommit = (repo: string, commit: string): void => {
  rmSync(apiCheckoutDir, { recursive: true, force: true });
  mkdirSync(apiCheckoutDir, { recursive: true });
  run('git', ['init', '-q'], apiCheckoutDir);
  run(
    'git',
    ['remote', 'add', 'origin', `https://github.com/${repo}`],
    apiCheckoutDir,
  );
  run('git', ['fetch', '-q', '--depth', '1', 'origin', commit], apiCheckoutDir);
  run('git', ['checkout', '-q', 'FETCH_HEAD'], apiCheckoutDir);
};

const collectProtoFiles = (baseDir: string): string[] => {
  const results: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.proto')) {
        results.push(entryPath);
      }
    }
  };
  walk(baseDir);
  return results.sort();
};

const generate = (repo: string, commit: string): void => {
  const temporalApiDir = join(apiCheckoutDir, 'temporal', 'api');
  if (!existsSync(temporalApiDir)) {
    throw new Error(`Expected temporal/api protos at ${temporalApiDir}`);
  }

  // Pass absolute file paths so protobufjs keys them identically to the paths it
  // resolves imports to (via the -p include path below). Relative explicit args
  // would be stored under a different key than the same file reached through an
  // import, causing "duplicate name" parse errors.
  const protoFiles = collectProtoFiles(temporalApiDir);
  log(`Collected ${protoFiles.length} temporal/api proto files`);

  // Include paths for import resolution:
  //  - apiCheckoutDir: temporal/api/** and the api repo's bundled google/** protos
  //    are both imported by repo-root-relative paths.
  //  - protobufjs' bundled google/** protos as a fallback for well-known types.
  const protobufjsDir = dirname(require.resolve('protobufjs/package.json'));

  mkdirSync(outputDir, { recursive: true });
  const jsonModulePath = join(outputDir, 'json-module.js');
  const rootDtsPath = join(outputDir, 'root.d.ts');
  const staticModulePath = join(cacheDir, 'static-module.js');

  const pbjsBin = require.resolve('protobufjs-cli/bin/pbjs');
  const pbtsBin = require.resolve('protobufjs-cli/bin/pbts');

  const includePaths = ['-p', apiCheckoutDir, '-p', protobufjsDir];

  // Runtime module: reflection-based json-module (small, no JSDoc).
  log('Running pbjs -> json-module.js');
  run(
    process.execPath,
    [
      pbjsBin,
      '-t',
      'json-module',
      '-w',
      'commonjs',
      ...includePaths,
      '-o',
      jsonModulePath,
      ...protoFiles,
    ],
    apiCheckoutDir,
  );

  // Types: pbts consumes a JSDoc-annotated static-module (the reflection
  // json-module carries no doc comments, so pbts alone would emit an empty
  // declaration file). The static module is a throwaway build artifact.
  log('Running pbjs -> static-module (for pbts input)');
  run(
    process.execPath,
    [
      pbjsBin,
      '-t',
      'static-module',
      '-w',
      'commonjs',
      ...includePaths,
      '-o',
      staticModulePath,
      ...protoFiles,
    ],
    apiCheckoutDir,
  );

  log('Running pbts -> root.d.ts');
  run(process.execPath, [pbtsBin, '-o', rootDtsPath, staticModulePath]);
  rmSync(staticModulePath, { force: true });

  writeFileSync(
    join(packageRoot, 'GENERATED_FROM'),
    `${repo}@${commit}\n` +
      `Generated on ${new Date().toISOString()} by scripts/generate-temporal-proto.ts\n` +
      'Local-only (gitignored). Do not commit vendor/temporalio-proto or the package.json override.\n',
  );
};

// The ui-server (grpc-gateway) decodes gRPC into JSON using proto descriptors
// baked in from its own `server/go.mod`. The generated TS types only match the
// wire if the ui-server is on a compatible `go.temporal.io/api`. Note the two
// version axes differ: proto types come from a temporalio/api git ref, while the
// ui-server pins a `go.temporal.io/api` release tag — so `@latest` is the
// practical match for `main`, not an exact one.
const syncUiServerApi = (version: string): void => {
  const serverDir = join(projectRoot, 'server');
  if (!existsSync(join(serverDir, 'go.mod'))) {
    throw new Error(`Expected ui-server go.mod at ${serverDir}`);
  }
  log(`Bumping ui-server go.temporal.io/api -> ${version} (local only)`);
  run('go', ['get', `go.temporal.io/api@${version}`], serverDir);
  log('Rebuilding ui-server (make build)');
  run('make', ['build'], serverDir);
  log('ui-server rebuilt. Restart `pnpm dev:local-temporal` to pick it up.');
};

// Add the local pnpm override that points @temporalio/proto at the generated
// package. Uses a targeted insertion so the working-tree diff is a single line
// (this change is local and must not be committed).
const applyLocalOverride = (): void => {
  const content = readFileSync(packageJsonPath, 'utf8');
  if (content.includes(`"${overrideName}"`)) {
    return;
  }
  const updated = content.replace(
    /("overrides"\s*:\s*\{)/,
    `$1\n      "${overrideName}": "${overrideSpec}",`,
  );
  if (updated === content) {
    throw new Error('Could not find a pnpm.overrides block in package.json');
  }
  writeFileSync(packageJsonPath, updated);
  log(
    `Added LOCAL override ${overrideName} -> ${overrideSpec} (do not commit)`,
  );
};

const removeLocalOverride = (): void => {
  const content = readFileSync(packageJsonPath, 'utf8');
  const updated = content.replace(
    new RegExp(`\\n\\s*"${overrideName}"\\s*:\\s*"[^"]*",?`),
    '',
  );
  if (updated !== content) {
    writeFileSync(packageJsonPath, updated);
    log('Removed local @temporalio/proto override from package.json');
  }
};

const pnpmInstall = (): void => {
  log('Running pnpm install');
  run('pnpm', ['install'], projectRoot);
};

const resetLocal = (): void => {
  removeLocalOverride();
  rmSync(packageRoot, { recursive: true, force: true });
  log('Removed vendor/temporalio-proto');
  run('git', ['checkout', '--', 'server/go.mod', 'server/go.sum'], projectRoot);
  log('Reverted server/go.mod + go.sum');
  pnpmInstall();
  log(
    'Reset complete — working tree matches the committed (published-proto) state.',
  );
};

const main = (): void => {
  if (reset) {
    resetLocal();
    return;
  }

  const commit = resolveCommit(REPO, ref);
  log(`Fetching ${REPO}@${commit}${commit === ref ? '' : ` (ref: ${ref})`}`);
  fetchApiRepoAtCommit(REPO, commit);

  generate(REPO, commit);
  applyLocalOverride();

  if (syncUiServer) {
    syncUiServerApi(uiServerVersion);
  }

  pnpmInstall();

  log(`Done. Generated from ${REPO}@${commit}.`);
  log(
    'vendor/temporalio-proto + the package.json override are LOCAL only — do not commit them.',
  );
};

main();
