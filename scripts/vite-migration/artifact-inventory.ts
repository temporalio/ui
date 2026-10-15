import { createHash } from 'node:crypto';
import {
  cp,
  mkdir,
  readdir,
  readFile,
  readlink,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brotliCompressSync,
  gzipSync,
  constants as zlibConstants,
} from 'node:zlib';

export type ArtifactInventoryEntry = {
  type: 'file' | 'symlink';
  path: string;
  sha256: string;
  bytes: number;
  gzipBytes: number;
  brotliBytes: number;
  linkTarget?: string;
};

export type ArtifactInventory = {
  version: 1;
  sha256: string;
  files: ArtifactInventoryEntry[];
  totals: {
    files: number;
    bytes: number;
    gzipBytes: number;
    brotliBytes: number;
  };
};

export const requiredArtifactOutputs = [
  'static',
  'docker',
  'embedded-server',
  'vercel',
  'package',
  'storybook',
  'catalog',
] as const;

export type RequiredArtifactOutput = (typeof requiredArtifactOutputs)[number];

export type ArtifactMatrixEntry = ArtifactInventory['totals'] & {
  sha256: string;
};

export type ArtifactMatrix = {
  version: 1;
  artifacts: Partial<Record<RequiredArtifactOutput, ArtifactMatrixEntry>>;
};

const assertCompleteArtifactMatrix = (matrix: ArtifactMatrix): void => {
  const missing = requiredArtifactOutputs.filter((output) => {
    const artifact = matrix.artifacts[output];
    return !artifact || artifact.files < 1 || !artifact.sha256;
  });
  if (missing.length) {
    throw new Error(`Missing required artifact outputs: ${missing.join(', ')}`);
  }
};

export const createArtifactMatrix = (
  artifacts: Partial<Record<RequiredArtifactOutput, ArtifactMatrixEntry>>,
): ArtifactMatrix => {
  const matrix: ArtifactMatrix = { version: 1, artifacts };
  assertCompleteArtifactMatrix(matrix);
  return matrix;
};

export const compareArtifactMatrices = (
  baseline: ArtifactMatrix,
  candidate: ArtifactMatrix,
) => {
  assertCompleteArtifactMatrix(baseline);
  assertCompleteArtifactMatrix(candidate);

  return {
    version: 1 as const,
    artifacts: Object.fromEntries(
      requiredArtifactOutputs.map((output) => {
        const baselineEntry = baseline.artifacts[output] as ArtifactMatrixEntry;
        const candidateEntry = candidate.artifacts[
          output
        ] as ArtifactMatrixEntry;

        return [
          output,
          {
            baseline: baselineEntry,
            candidate: candidateEntry,
            changed:
              JSON.stringify(baselineEntry) !== JSON.stringify(candidateEntry),
          },
        ];
      }),
    ),
  };
};

export const artifactMatrixEntry = (
  inventory: ArtifactInventory,
): ArtifactMatrixEntry => ({
  sha256: inventory.sha256,
  ...inventory.totals,
});

type ArtifactPath = {
  type: 'file' | 'symlink';
  path: string;
  linkTarget?: string;
};

type ArtifactIdentityEntry = Pick<
  ArtifactInventoryEntry,
  'path' | 'sha256' | 'type'
>;

const listArtifactPaths = async (
  root: string,
  directory = root,
): Promise<ArtifactPath[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: ArtifactPath[] = [];

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const entryPath = path.join(directory, entry.name);
    const relativePath = path
      .relative(root, entryPath)
      .split(path.sep)
      .join('/');
    if (entry.isSymbolicLink()) {
      paths.push({
        type: 'symlink',
        path: relativePath,
        linkTarget: await readlink(entryPath),
      });
    } else if (entry.isDirectory()) {
      paths.push(...(await listArtifactPaths(root, entryPath)));
    } else if (entry.isFile()) {
      paths.push({ type: 'file', path: relativePath });
    } else {
      throw new Error(`Unsupported artifact entry: ${entryPath}`);
    }
  }

  return paths;
};

const digestArtifactEntries = (
  entries: readonly ArtifactIdentityEntry[],
): string => {
  const digest = createHash('sha256');
  for (const entry of entries) {
    digest.update(entry.type);
    digest.update('\0');
    digest.update(entry.path);
    digest.update('\0');
    digest.update(entry.sha256);
    digest.update('\0');
  }
  return digest.digest('hex');
};

export const artifactContentIdentity = async (
  buildDirectory: string,
): Promise<string> => {
  const root = path.resolve(buildDirectory);
  const rootStat = await stat(root);
  if (!rootStat.isDirectory()) {
    throw new Error(`Build path is not a directory: ${root}`);
  }
  const artifactPaths = await listArtifactPaths(root);
  const entries = await Promise.all(
    artifactPaths.map(async (artifact): Promise<ArtifactIdentityEntry> => {
      const content =
        artifact.type === 'symlink'
          ? Buffer.from(artifact.linkTarget ?? '')
          : await readFile(path.join(root, artifact.path));
      return {
        type: artifact.type,
        path: artifact.path,
        sha256: createHash('sha256').update(content).digest('hex'),
      };
    }),
  );
  return digestArtifactEntries(entries);
};

export const archiveBuild = async (
  buildDirectory: string,
  archiveDirectory: string,
): Promise<void> => {
  const source = path.resolve(buildDirectory);
  const archive = path.resolve(archiveDirectory);
  const sourceStat = await stat(source);
  if (!sourceStat.isDirectory()) {
    throw new Error(`Build path is not a directory: ${source}`);
  }

  try {
    await mkdir(archive);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      throw new Error(`Artifact archive already exists: ${archive}`);
    }
    throw error;
  }

  const entries = await readdir(source);
  await Promise.all(
    entries.map((entry) =>
      cp(path.join(source, entry), path.join(archive, entry), {
        dereference: false,
        recursive: true,
        force: false,
        errorOnExist: true,
        verbatimSymlinks: true,
      }),
    ),
  );
};

export const inventoryBuild = async (
  buildDirectory: string,
): Promise<ArtifactInventory> => {
  const root = path.resolve(buildDirectory);
  const rootStat = await stat(root);
  if (!rootStat.isDirectory()) {
    throw new Error(`Build path is not a directory: ${root}`);
  }

  const artifactPaths = await listArtifactPaths(root);
  const entries = await Promise.all(
    artifactPaths.map(async (artifact): Promise<ArtifactInventoryEntry> => {
      const content =
        artifact.type === 'symlink'
          ? Buffer.from(artifact.linkTarget ?? '')
          : await readFile(path.join(root, artifact.path));

      return {
        type: artifact.type,
        path: artifact.path,
        ...(artifact.type === 'symlink'
          ? { linkTarget: artifact.linkTarget }
          : {}),
        sha256: createHash('sha256').update(content).digest('hex'),
        bytes: content.byteLength,
        gzipBytes: gzipSync(content, { level: 9 }).byteLength,
        brotliBytes: brotliCompressSync(content, {
          params: {
            [zlibConstants.BROTLI_PARAM_QUALITY]:
              zlibConstants.BROTLI_MAX_QUALITY,
          },
        }).byteLength,
      };
    }),
  );

  return {
    version: 1,
    sha256: digestArtifactEntries(entries),
    files: entries,
    totals: entries.reduce(
      (totals, entry) => ({
        files: totals.files + 1,
        bytes: totals.bytes + entry.bytes,
        gzipBytes: totals.gzipBytes + entry.gzipBytes,
        brotliBytes: totals.brotliBytes + entry.brotliBytes,
      }),
      { files: 0, bytes: 0, gzipBytes: 0, brotliBytes: 0 },
    ),
  };
};

export const writeArtifactInventory = async (
  buildDirectory: string,
  outputPath: string,
): Promise<ArtifactInventory> => {
  const root = path.resolve(buildDirectory);
  const output = path.resolve(outputPath);
  const relativeOutput = path.relative(root, output);

  if (
    relativeOutput === '' ||
    (!relativeOutput.startsWith(`..${path.sep}`) &&
      relativeOutput !== '..' &&
      !path.isAbsolute(relativeOutput))
  ) {
    throw new Error(
      'Artifact inventory output must be outside the build directory',
    );
  }

  const inventory = await inventoryBuild(root);
  await mkdir(path.dirname(output), { recursive: true });

  try {
    await writeFile(output, `${JSON.stringify(inventory, null, 2)}\n`, {
      flag: 'wx',
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      throw new Error(`Artifact inventory already exists: ${output}`);
    }
    throw error;
  }

  return inventory;
};

const argumentValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const run = async (): Promise<void> => {
  const matrixOutputPath = argumentValue('--matrix-output');
  if (matrixOutputPath) {
    const artifacts: Partial<
      Record<RequiredArtifactOutput, ArtifactMatrixEntry>
    > = {};

    for (const output of requiredArtifactOutputs) {
      const inventoryPath = argumentValue(`--${output}`);
      if (!inventoryPath) continue;
      const inventory = JSON.parse(
        await readFile(inventoryPath, 'utf8'),
      ) as ArtifactInventory;
      artifacts[output] = artifactMatrixEntry(inventory);
    }

    const matrix = createArtifactMatrix(artifacts);
    await mkdir(path.dirname(path.resolve(matrixOutputPath)), {
      recursive: true,
    });
    await writeFile(matrixOutputPath, `${JSON.stringify(matrix, null, 2)}\n`, {
      flag: 'wx',
    });
    process.stdout.write(
      `${requiredArtifactOutputs.length} artifact outputs recorded\n`,
    );
    return;
  }

  const baselineMatrixPath = argumentValue('--compare-baseline');
  const candidateMatrixPath = argumentValue('--compare-candidate');
  const comparisonOutputPath = argumentValue('--comparison-output');
  if (baselineMatrixPath || candidateMatrixPath || comparisonOutputPath) {
    if (!baselineMatrixPath || !candidateMatrixPath || !comparisonOutputPath) {
      throw new Error(
        '--compare-baseline, --compare-candidate, and --comparison-output are required together',
      );
    }

    const baseline = JSON.parse(
      await readFile(baselineMatrixPath, 'utf8'),
    ) as ArtifactMatrix;
    const candidate = JSON.parse(
      await readFile(candidateMatrixPath, 'utf8'),
    ) as ArtifactMatrix;
    const comparison = compareArtifactMatrices(baseline, candidate);
    await mkdir(path.dirname(path.resolve(comparisonOutputPath)), {
      recursive: true,
    });
    await writeFile(
      comparisonOutputPath,
      `${JSON.stringify(comparison, null, 2)}\n`,
      { flag: 'wx' },
    );
    process.stdout.write(
      `${requiredArtifactOutputs.length} artifact outputs compared\n`,
    );
    return;
  }

  const buildDirectory = argumentValue('--build');
  const outputPath = argumentValue('--output');

  if (!buildDirectory || !outputPath) {
    throw new Error(
      'Usage: artifact-inventory.ts --build <directory> --output <inventory.json>',
    );
  }

  const archiveDirectory = argumentValue('--archive');
  const inventoryRoot = archiveDirectory ?? buildDirectory;
  if (archiveDirectory) {
    await archiveBuild(buildDirectory, archiveDirectory);
  }
  const inventory = await writeArtifactInventory(inventoryRoot, outputPath);
  process.stdout.write(
    `${inventory.files.length} files inventoried as ${inventory.sha256}\n`,
  );
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  });
}
