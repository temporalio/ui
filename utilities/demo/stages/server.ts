import { createHash } from 'crypto';
import { existsSync, readdirSync } from 'fs';
import { chmod, mkdir, readFile, writeFile } from 'fs/promises';
import zlib from 'node:zlib';
import { join } from 'path';
import { finished } from 'stream/promises';

import fetch from 'node-fetch';
import tar from 'tar-fs';
import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

import { expandPath, type ServerDefinition } from '../definition';
import { type Logger, runDirFor, WORK_DIR } from '../paths';
import { startDetached, type Supervised } from '../process';
import {
  type CliCandidate,
  type CommitFacts,
  lowestTaggedVersion,
  pickCli,
  planServerStrategy,
  satisfies,
} from '../requirements';

export type ProvisionedServer = {
  binary: string;
  serverVersion: string;
  cliVersion: string;
  address: string;
  namespace: string;
  bundledUiUrl: string;
  provenance: string[];
  reusedExisting: boolean;
  process?: Supervised;
};

const BIN_DIR = join(WORK_DIR, 'bin');

const versionsFrom = (output: string) => {
  const cli = /^temporal version (\S+)/m.exec(output)?.[1] ?? 'unknown';
  const server =
    /Server (\d+\.\d+\.\d+[^,)\s]*)/.exec(output)?.[1] ?? 'unknown';

  return { cli, server };
};

const readVersions = async (binary: string) => {
  const { stdout, exitCode } = await $`${binary} -v`.quiet().nothrow();

  if (exitCode !== 0) {
    throw new Error(`${binary} is not a runnable Temporal CLI.`);
  }

  return versionsFrom(stdout);
};

const GO_PATHSPEC = ['*.go', 'go.mod', 'go.sum'];

const pathFromStatusLine = (line: string) => {
  const path = line.slice(3);
  const renamed = path.split(' -> ');

  return renamed[renamed.length - 1].replace(/^"|"$/g, '');
};

/**
 * Identifies the Go source a build would actually see: the commit, plus the
 * content of every Go file the working tree changes or adds. A checkout that
 * carries unrelated local changes, such as an untracked directory or a
 * `replace` for a sibling module, keeps hitting the build cache, while a real
 * edit to Go source misses it.
 */
const goFingerprint = async (repo: string, sha: string) => {
  const status = (
    await $`git -C ${repo} status --porcelain -- ${GO_PATHSPEC}`
      .quiet()
      .nothrow()
  ).stdout;

  const hash = createHash('sha256').update(sha);
  const lines = status.split('\n').filter(Boolean).sort();

  for (const line of lines) {
    hash.update(line);

    try {
      hash.update(await readFile(join(repo, pathFromStatusLine(line))));
    } catch {
      // Deleted or unreadable: the status line already records the change.
    }
  }

  return {
    fingerprint: hash.digest('hex').slice(0, 12),
    changedGoFiles: lines.length,
  };
};

const gitDescribe = async (repo: string) => {
  const sha = (
    await $`git -C ${repo} rev-parse --short HEAD`.quiet().nothrow()
  ).stdout.trim();
  const ref = (
    await $`git -C ${repo} rev-parse --abbrev-ref HEAD`.quiet().nothrow()
  ).stdout.trim();
  const { fingerprint, changedGoFiles } = await goFingerprint(repo, sha);

  return { sha, ref, fingerprint, changedGoFiles };
};

const downloadCli = async (version: string, log: Logger): Promise<string> => {
  const destination = join(BIN_DIR, `cli-${version}`);
  const binary = join(destination, 'temporal');

  if (existsSync(binary)) {
    log(`Reusing the CLI already downloaded at ${binary}`);
    return binary;
  }

  const arch = process.arch === 'x64' ? 'amd64' : process.arch;
  const url = `https://temporal.download/cli/archive/${version}?platform=${process.platform}&arch=${arch}`;

  log(`Downloading the Temporal CLI from ${url}`);

  const response = await fetch(url);

  if (!response.ok || !response.body) {
    const hint =
      response.status === 404 &&
      version !== 'latest' &&
      !version.startsWith('v')
        ? ` A pinned version needs the "v" prefix, so try "v${version}".`
        : '';

    throw new Error(
      `Could not download the Temporal CLI ${version}: ${response.status} ${response.statusText}.${hint}`,
    );
  }

  await mkdir(destination, { recursive: true });
  await finished(
    response.body.pipe(zlib.createGunzip()).pipe(tar.extract(destination)),
  );
  await chmod(binary, 0o755);

  return binary;
};

/**
 * Compiles the CLI's dev server against a local `temporalio/temporal` checkout
 * through a Go workspace held in the run directory. Neither repository is
 * modified: no `replace` directive is added and no `go.work` is written inside
 * either tree.
 */
/**
 * Where the Temporal checkouts live on this machine. A definition may name them,
 * but normally the environment does, so a definition stays portable.
 */
const CHECKOUT_DIR = join(WORK_DIR, 'checkouts');

const REPOS = {
  server: {
    url: 'https://github.com/temporalio/temporal.git',
    label: 'Temporal server',
    variable: 'TEMPORAL_SERVER_REPO',
  },
  cli: {
    url: 'https://github.com/temporalio/cli.git',
    label: 'Temporal CLI',
    variable: 'TEMPORAL_CLI_REPO',
  },
} as const;

type RepoSource = {
  path: string;
  ref: string;
  sha: string;
  /** A checkout this tool owns is clean, so its commit identifies it fully. */
  key: string;
  provenance: string;
};

/**
 * Fetches one commit rather than cloning a repository. GitHub serves a blobless
 * shallow fetch of any reachable commit, so this costs seconds instead of the
 * whole history, and the checkout belongs to this tool rather than to whatever a
 * person happens to have open.
 */
const ensureCheckout = async (
  repo: (typeof REPOS)[keyof typeof REPOS],
  ref: string,
  log: Logger,
): Promise<RepoSource> => {
  const path = join(CHECKOUT_DIR, `${repo.variable.toLowerCase()}-${ref}`);
  const head = async () =>
    (await $`git -C ${path} rev-parse HEAD`.quiet().nothrow()).stdout.trim();

  const pinned = /^[0-9a-f]{7,40}$/.test(ref);
  const current = existsSync(join(path, '.git')) ? await head() : '';

  // A pinned commit cannot move, so an existing checkout of it is reusable. A
  // branch can move, so it is fetched again.
  if (!current || !pinned) {
    log(`Fetching ${repo.label} at ${ref}`);

    await mkdir(path, { recursive: true });
    await $`git -C ${path} init -q`.quiet().nothrow();
    await $`git -C ${path} remote add origin ${repo.url}`.quiet().nothrow();

    const fetched =
      await $`git -C ${path} fetch --depth 1 --filter=blob:none origin ${ref}`
        .quiet()
        .nothrow();

    if (fetched.exitCode !== 0) {
      throw new Error(
        [
          `Could not fetch ${ref} from ${repo.url}.`,
          `Set ${repo.variable} to a local checkout instead, or check the ref.`,
          fetched.stderr.trim(),
        ].join('\n'),
      );
    }

    await $`git -C ${path} checkout -q --force FETCH_HEAD`.quiet().nothrow();
  }

  const sha = await head();

  return {
    path,
    ref,
    sha,
    key: sha,
    provenance: `${repo.label}: ${repo.url} @ ${ref} (${sha.slice(0, 9)}), fetched into ${path}`,
  };
};

/** A checkout somebody is working in, which may carry uncommitted changes. */
const useLocalRepo = async (
  repo: (typeof REPOS)[keyof typeof REPOS],
  path: string,
): Promise<RepoSource> => {
  const expanded = expandPath(path);

  if (!existsSync(join(expanded, 'go.mod'))) {
    throw new Error(`${expanded} is not a Go module checkout.`);
  }

  const described = await gitDescribe(expanded);
  const uncommitted = described.changedGoFiles
    ? `, ${described.changedGoFiles} uncommitted Go file(s)`
    : '';

  return {
    path: expanded,
    ref: described.ref,
    sha: described.sha,
    key: `${described.sha}-${described.fingerprint}`,
    provenance: `${repo.label}: ${expanded} @ ${described.ref} (${described.sha}${uncommitted})`,
  };
};

/**
 * A pinned checkout by default, so the demo needs no configuration and does not
 * compile whatever a person has open. An explicit path wins, because somebody
 * developing the feature wants their own working tree.
 */
const resolveRepo = async (
  repo: (typeof REPOS)[keyof typeof REPOS],
  fromDefinition: string | undefined,
  ref: string | undefined,
  log: Logger,
): Promise<RepoSource> => {
  const local = fromDefinition ?? process.env[repo.variable];

  if (local) return useLocalRepo(repo, local);

  if (!ref) {
    throw new Error(
      [
        `A build of the ${repo.label} needs a ref to fetch, and this definition gives none.`,
        repo.variable === 'TEMPORAL_SERVER_REPO'
          ? 'Set requires.serverCommit in the definition, or point TEMPORAL_SERVER_REPO at a checkout.'
          : `Set requires.cliRef in the definition, or point ${repo.variable} at a checkout.`,
      ].join('\n'),
    );
  }

  return ensureCheckout(repo, ref, log);
};

const buildWorkspaceCli = async (
  server: ServerDefinition,
  log: Logger,
): Promise<{ binary: string; provenance: string[] }> => {
  const [cli, temporal] = await Promise.all([
    resolveRepo(REPOS.cli, server.cliRepo, server.requires.cliRef, log),
    resolveRepo(
      REPOS.server,
      server.serverRepo,
      server.serverRef ?? server.requires.serverRef,
      log,
    ),
  ]);

  const required = server.requires.serverCommit;

  const shallow =
    (
      await $`git -C ${temporal.path} rev-parse --is-shallow-repository`
        .quiet()
        .nothrow()
    ).stdout.trim() === 'true';

  // A fetched checkout has one commit, so ancestry cannot be computed from it.
  // The version floor covers that case, checked against the built binary.
  if (required && !shallow) {
    const contains =
      await $`git -C ${temporal.path} merge-base --is-ancestor ${required} HEAD`
        .quiet()
        .nothrow();

    if (contains.exitCode !== 0) {
      throw new Error(
        [
          `${temporal.path} is at ${temporal.sha.slice(0, 9)}, which does not contain ${required.slice(0, 9)}.`,
          'That commit adds the feature this scenario shows. Fetch a ref that has it,',
          'or set requires.serverRef to one.',
        ].join('\n'),
      );
    }
  }

  const binary = join(BIN_DIR, `temporal-workspace-${cli.key}-${temporal.key}`);
  const goWork = join(WORK_DIR, 'go.work');

  await mkdir(BIN_DIR, { recursive: true });
  await writeFile(
    goWork,
    `go 1.26.4\n\nuse (\n\t${cli.path}\n\t${temporal.path}\n)\n`,
  );

  const provenance = [
    cli.provenance,
    temporal.provenance,
    `Go workspace: ${goWork} (neither checkout modified)`,
  ];

  if (existsSync(binary)) {
    log(`Reusing the workspace build at ${binary}`);
    return { binary, provenance };
  }

  log('Building the CLI against that server. This takes a few minutes.');

  const build = $({
    cwd: cli.path,
    env: { ...process.env, GOWORK: goWork },
  })`go build -o ${binary} ./cmd/temporal`;

  const { exitCode, stderr, stdout } = await build.nothrow();

  if (exitCode !== 0) {
    // go reports compile errors on stdout as often as stderr.
    throw new Error(
      [
        'The workspace build failed.',
        'These two checkouts share one dependency graph, so they have to be a',
        'compatible pair. Move requires.serverRef and requires.cliRef together.',
        `${cli.provenance}`,
        `${temporal.provenance}`,
        '',
        [stderr, stdout].filter(Boolean).join('\n').trim() ||
          'The build produced no output.',
      ].join('\n'),
    );
  }

  return { binary, provenance };
};

/** Reads what a commit means for the release line, from the server checkout. */
const readCommitFacts = async (
  repo: string,
  commit: string,
): Promise<CommitFacts> => {
  const isAncestor = async (ref: string) =>
    (
      await $`git -C ${repo} merge-base --is-ancestor ${commit} ${ref}`
        .quiet()
        .nothrow()
    ).exitCode === 0;

  const known =
    (
      await $`git -C ${repo} cat-file -e ${`${commit}^{commit}`}`
        .quiet()
        .nothrow()
    ).exitCode === 0;

  if (!known) {
    return { knownLocally: false, inCheckout: false, onMain: false };
  }

  let onMain = false;

  for (const ref of ['origin/main', 'main']) {
    if (await isAncestor(ref)) {
      onMain = true;
      break;
    }
  }

  const tags = (
    await $`git -C ${repo} tag --contains ${commit}`.quiet().nothrow()
  ).stdout
    .split('\n')
    .filter(Boolean);

  return {
    knownLocally: true,
    inCheckout: await isAncestor('HEAD'),
    onMain,
    firstTaggedVersion: lowestTaggedVersion(tags),
  };
};

const cliCandidate = async (
  label: string,
  path: string,
): Promise<CliCandidate | undefined> => {
  if (!existsSync(path)) return undefined;

  try {
    const { server } = await readVersions(path);

    return { label, path, serverVersion: server };
  } catch {
    return undefined;
  }
};

/** CLIs already on this machine, which cost nothing to reuse. */
const PREPARED_CLI = join(process.cwd(), 'bin', 'cli', 'temporal');

const cliCandidatesOnDisk = async (): Promise<CliCandidate[]> => {
  const paths = [
    ['bin/cli/temporal (from pnpm prepare)', PREPARED_CLI],
    ...(existsSync(BIN_DIR)
      ? readdirSync(BIN_DIR)
          .filter((entry) => entry.startsWith('cli-'))
          .map(
            (entry) =>
              [
                `${entry} (downloaded earlier)`,
                join(BIN_DIR, entry, 'temporal'),
              ] as const,
          )
      : []),
  ] as const;

  const candidates = await Promise.all(
    paths.map(([label, path]) => cliCandidate(label, path)),
  );

  return candidates.filter(
    (candidate): candidate is CliCandidate => !!candidate,
  );
};

const explicitBinary = (server: ServerDefinition) => {
  if (!server.path) {
    throw new Error('server.source "binary" needs server.path.');
  }

  const binary = expandPath(server.path);

  if (!existsSync(binary)) throw new Error(`${binary} does not exist.`);

  return { binary, provenance: [`Binary: ${binary}`] };
};

/**
 * Picks the cheapest server that meets the feature's requirement. A CLI already
 * on disk costs nothing, a published release costs a download, and compiling the
 * server checkout costs minutes, so they are tried in that order. An explicit
 * `source` skips the choice.
 */
const resolveBinary = async (
  server: ServerDefinition,
  log: Logger,
): Promise<{
  binary: string;
  provenance: string[];
  minServerVersion?: string;
}> => {
  if (server.source === 'binary') return explicitBinary(server);

  if (server.source === 'workspace') {
    return {
      ...(await buildWorkspaceCli(server, log)),
      minServerVersion: server.requires.minServerVersion,
    };
  }

  if (server.source === 'cli') {
    return {
      binary: await downloadCli(server.version, log),
      provenance: [
        `Temporal CLI release: ${server.version} (temporal.download)`,
      ],
      minServerVersion: server.requires.minServerVersion,
    };
  }

  // A server checkout is only needed to build one. Without it the plan still
  // works from a release, and only a local build reports the missing path.
  const serverRepo = server.serverRepo ?? process.env.TEMPORAL_SERVER_REPO;
  const commit =
    server.requires.serverCommit && serverRepo
      ? await readCommitFacts(
          expandPath(serverRepo),
          server.requires.serverCommit,
        )
      : undefined;

  const plan = planServerStrategy(server.requires, commit);

  for (const reason of plan.reasons) log(reason);

  if (!plan.mustBuildLocally) {
    const onDisk = pickCli(await cliCandidatesOnDisk(), plan.minServerVersion);

    if (onDisk) {
      log(
        `Reusing ${onDisk.label}: it bundles Server ${onDisk.serverVersion}.`,
      );

      return {
        binary: onDisk.path,
        provenance: [
          ...plan.reasons,
          `Server from ${onDisk.label}, which bundles Server ${onDisk.serverVersion}.`,
        ],
        minServerVersion: plan.minServerVersion,
      };
    }

    // `pnpm prepare` downloads the latest release into bin/cli, so when that
    // binary is present there is nothing new to fetch for "latest".
    const preparedIsLatest =
      server.version === 'latest' && existsSync(PREPARED_CLI);

    const downloaded = preparedIsLatest
      ? await cliCandidate(
          'bin/cli/temporal (the latest release)',
          PREPARED_CLI,
        )
      : await cliCandidate(
          `Temporal CLI ${server.version}`,
          await downloadCli(server.version, log),
        );

    if (
      downloaded &&
      satisfies(downloaded.serverVersion, plan.minServerVersion)
    ) {
      return {
        binary: downloaded.path,
        provenance: [
          ...plan.reasons,
          `Server from the ${server.version} CLI release, which bundles Server ${downloaded.serverVersion}.`,
        ],
        minServerVersion: plan.minServerVersion,
      };
    }

    log(
      `The ${server.version} CLI release bundles Server ${downloaded?.serverVersion ?? 'unknown'}, which is too old. Compiling the server checkout instead.`,
    );
  }

  if (commit && !commit.inCheckout && serverRepo) {
    throw new Error(
      [
        `Commit ${server.requires.serverCommit?.slice(0, 9)} is not an ancestor of HEAD in ${serverRepo}, so a build there would not contain the feature.`,
        `Check out a ref that has it:  git -C ${serverRepo} log --oneline -1 ${server.requires.serverCommit}`,
      ].join('\n'),
    );
  }

  const built = await buildWorkspaceCli(server, log);

  return {
    ...built,
    provenance: [...plan.reasons, ...built.provenance],
    minServerVersion: plan.minServerVersion,
  };
};

const dynamicConfigFlags = (values: ServerDefinition['dynamicConfig']) =>
  Object.entries(values).flatMap(([key, value]) => [
    '--dynamic-config-value',
    `${key}=${JSON.stringify(value)}`,
  ]);

const searchAttributeFlags = (values: ServerDefinition['searchAttributes']) =>
  Object.entries(values).flatMap(([key, type]) => [
    '--search-attribute',
    `${key}=${type}`,
  ]);

export const startServer = async (
  server: ServerDefinition,
  log: Logger,
  runName: string,
): Promise<ProvisionedServer> => {
  const address = `127.0.0.1:${server.port}`;
  const bundledUiUrl = `http://localhost:${server.uiPort}`;

  const alreadyRunning = await waitForPort({
    port: server.port,
    timeout: 250,
    output: 'silent',
  });

  if (alreadyRunning.open) {
    log(
      chalk.yellow(
        `Something is already listening on ${address}. Reusing it. The dynamic config and version checks in this definition were NOT applied to it.`,
      ),
    );

    return {
      binary: '(existing process)',
      serverVersion: 'unknown',
      cliVersion: 'unknown',
      address,
      namespace: server.namespace,
      bundledUiUrl,
      provenance: [`Reused the server already listening on ${address}`],
      reusedExisting: true,
    };
  }

  const { binary, provenance, minServerVersion } = await resolveBinary(
    server,
    log,
  );
  const versions = await readVersions(binary);

  if (!satisfies(versions.server, minServerVersion)) {
    throw new Error(
      [
        `This feature needs Temporal Server ${minServerVersion} or later, but ${binary} bundles ${versions.server}.`,
        'Set server.source to "workspace" to compile your own server checkout into the dev server.',
      ].join('\n'),
    );
  }

  const flags = [
    `--port=${server.port}`,
    `--ui-port=${server.uiPort}`,
    `--http-port=${server.httpPort ?? server.port + 1}`,
    `--log-level=${server.logLevel}`,
    ...(server.dbFilename
      ? [`--db-filename=${expandPath(server.dbFilename)}`]
      : []),
    ...(server.namespace === 'default'
      ? []
      : [`--namespace=${server.namespace}`]),
    ...searchAttributeFlags(server.searchAttributes),
    ...dynamicConfigFlags(server.dynamicConfig),
  ];

  log(`Starting ${binary} (Server ${versions.server}) on ${address}`);

  await mkdir(runDirFor(runName), { recursive: true });

  const child = startDetached(
    'server',
    binary,
    ['server', 'start-dev', ...flags],
    {
      logFile: join(runDirFor(runName), 'server.log'),
    },
  );

  const ready = await Promise.all([
    waitForPort({ port: server.port, output: 'silent', timeout: 60_000 }),
    waitForPort({ port: server.uiPort, output: 'silent', timeout: 60_000 }),
  ]);

  if (!ready.every((port) => port.open)) {
    await child.stop();

    throw new Error(
      [
        `The Temporal server did not come up on ${address}.`,
        `Its log is at ${child.logFile}.`,
        `Run this to see why:  ${binary} server start-dev ${flags.join(' ')}`,
      ].join('\n'),
    );
  }

  return {
    binary,
    serverVersion: versions.server,
    cliVersion: versions.cli,
    address,
    namespace: server.namespace,
    bundledUiUrl,
    provenance,
    reusedExisting: false,
    process: child,
  };
};
