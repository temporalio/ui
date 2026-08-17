import { lstat, rename } from 'node:fs/promises';
import { join } from 'node:path';

type LocalMigration = {
  legacyPath: string;
  canonicalPath: string;
  kind: 'directory' | 'file';
};

const localMigrations: readonly LocalMigration[] = [
  {
    legacyPath: 'workflow-catalog.local',
    canonicalPath: 'catalog.local',
    kind: 'directory',
  },
  {
    legacyPath: '.env.workflow-catalog.local',
    canonicalPath: '.env.catalog.local',
    kind: 'file',
  },
];

const pathKind = async (path: string) => {
  try {
    const stats = await lstat(path);
    if (stats.isDirectory()) return 'directory';
    if (stats.isFile()) return 'file';
    return 'other';
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'missing';
    throw error;
  }
};

const conflictMessage = (conflicts: readonly LocalMigration[]) =>
  [
    'Catalog local-state migration stopped because both legacy and canonical paths exist:',
    ...conflicts.map(
      ({ legacyPath, canonicalPath }) => `  ${legacyPath} and ${canonicalPath}`,
    ),
    'Merge each legacy path into its canonical path or remove one of the two, then rerun the command. No files were changed.',
  ].join('\n');

/**
 * Moves pre-Catalog local examples and credentials to their canonical paths.
 * Legacy mutation locks and journals are intentionally left in place and
 * ignored: they describe an obsolete transaction namespace and are unsafe to
 * resume under the canonical paths.
 */
export const migrateLegacyCatalogLocalState = async (rootDirectory: string) => {
  const candidates = await Promise.all(
    localMigrations.map(async (migration) => ({
      ...migration,
      legacyKind: await pathKind(join(rootDirectory, migration.legacyPath)),
      canonicalKind: await pathKind(
        join(rootDirectory, migration.canonicalPath),
      ),
    })),
  );
  const conflicts = candidates.filter(
    ({ legacyKind, canonicalKind }) =>
      legacyKind !== 'missing' && canonicalKind !== 'missing',
  );

  if (conflicts.length > 0) throw new Error(conflictMessage(conflicts));

  const invalid = candidates.find(
    ({ legacyKind, kind }) => legacyKind !== 'missing' && legacyKind !== kind,
  );
  if (invalid) {
    throw new Error(
      `Catalog local-state migration expected ${invalid.legacyPath} to be a ${invalid.kind}. Resolve that path, then rerun the command. No files were changed.`,
    );
  }

  const pending = candidates.filter(
    ({ legacyKind, canonicalKind }) =>
      legacyKind !== 'missing' && canonicalKind === 'missing',
  );
  const migrated: typeof pending = [];

  try {
    for (const migration of pending) {
      await rename(
        join(rootDirectory, migration.legacyPath),
        join(rootDirectory, migration.canonicalPath),
      );
      migrated.push(migration);
    }
  } catch (error) {
    const rollbackFailures: string[] = [];
    for (const migration of migrated.reverse()) {
      try {
        await rename(
          join(rootDirectory, migration.canonicalPath),
          join(rootDirectory, migration.legacyPath),
        );
      } catch {
        rollbackFailures.push(migration.canonicalPath);
      }
    }

    if (rollbackFailures.length > 0) {
      throw new Error(
        `Catalog local-state migration failed and could not restore ${rollbackFailures.join(', ')}. Preserve these ignored paths and resolve them manually before rerunning the command.`,
        { cause: error },
      );
    }

    throw new Error(
      'Catalog local-state migration failed; completed moves were restored and no Catalog command was run.',
      { cause: error },
    );
  }

  return pending.map(({ legacyPath, canonicalPath }) => ({
    legacyPath,
    canonicalPath,
  }));
};
