import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { getProjectRoot } from '../get-project-root.js';
import {
  verifyCanonicalWorkflowCatalogAssemblies,
  writeCanonicalWorkflowCatalogAssemblies,
} from './canonical-assemblies.js';
import {
  executeDirectoryWorkflowCatalogPromotion,
  planDirectoryWorkflowCatalogPromotion,
  withWorkflowCatalogMutationLock,
} from './directory-promotion.js';
import {
  verifyLocalWorkflowCatalogAssemblies,
  writeLocalWorkflowCatalogAssemblies,
} from './local-assemblies.js';

export const workflowCatalogHelp = `Usage: workflow-catalog <command>

Commands:
  workflow-catalog help                   Show this help text.
  workflow-catalog scaffold <example-id>  Create a local workflow catalog example.
  workflow-catalog generate               Generate workflow catalog artifacts.
  workflow-catalog verify                 Verify workflow catalog artifacts and boundaries.
  workflow-catalog promote <example-id> [--dry-run]
                                           Promote or preview a directory-backed local example.
  workflow-catalog dev                    Start the catalog UI and worker.
  workflow-catalog worker                 Start the catalog worker.`;

export const workflowCatalogCommandAliases = {
  new: 'scaffold',
  'dev:catalog': 'dev',
  'dev:workflow-catalog-worker': 'worker',
} as const;

type WorkflowCatalogCommand = (...arguments_: string[]) => unknown;

class ReportedWorkflowCatalogError extends Error {}

export const runWorkflowCatalogCommand = async ({
  arguments: arguments_,
  commands,
  writeError,
  writeOutput,
}: {
  arguments: readonly string[];
  commands: Partial<Record<string, WorkflowCatalogCommand>>;
  writeError: (message: string) => void;
  writeOutput: (message: string) => void;
}) => {
  const commandName = arguments_[0];

  if (!commandName || !commands[commandName]) {
    const message = `Unknown workflow catalog command "${commandName ?? ''}"`;
    writeError(`${message}\n\n${workflowCatalogHelp}`);
    throw new ReportedWorkflowCatalogError(message);
  }

  const command = commands[commandName];

  const expectedArgumentCounts: Partial<Record<string, readonly number[]>> = {
    dev: [1],
    generate: [1],
    help: [1],
    promote: [2, 3],
    scaffold: [2],
    verify: [1],
    worker: [1],
  };
  const allowedArgumentCounts = expectedArgumentCounts[commandName];

  if (
    allowedArgumentCounts &&
    !allowedArgumentCounts.includes(arguments_.length)
  ) {
    const message = `Invalid arguments for workflow catalog command "${commandName}"`;
    writeError(`${message}\n\n${workflowCatalogHelp}`);
    throw new ReportedWorkflowCatalogError(message);
  }

  if (commandName === 'scaffold') {
    await command(...arguments_.slice(1));
    await commands.generate?.();
    writeOutput(
      `Created local workflow catalog example "${arguments_[1]}". Edit its files, then run "pnpm workflow-catalog dev".`,
    );
    return;
  }

  const result = await command(...arguments_.slice(1));

  if (commandName === 'generate') {
    writeOutput('Workflow catalog artifacts generated.');
  }

  if (commandName === 'verify') {
    writeOutput('Workflow catalog artifacts verified.');
  }

  if (
    commandName === 'promote' &&
    typeof result === 'object' &&
    result !== null &&
    'changedPaths' in result &&
    Array.isArray(result.changedPaths)
  ) {
    writeOutput(
      [
        'Workflow catalog example promoted. Changed paths:',
        ...result.changedPaths.map((path) => `  ${String(path)}`),
        'Review and commit these changes manually.',
      ].join('\n'),
    );
  }
};

const runCatalogDevelopmentEntry = (script: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'esno', script], {
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${script} exited with status ${code ?? 'unknown'}`));
    });
  });

const createRuntimeCommands = () => {
  const rootDirectory = getProjectRoot();
  const generateUnlocked = async () => {
    await writeLocalWorkflowCatalogAssemblies(rootDirectory);
    await writeCanonicalWorkflowCatalogAssemblies(rootDirectory);
    const { generateProjectWorkflowCatalog } =
      await import('./project-artifacts.js');
    await generateProjectWorkflowCatalog();
  };
  const generate = () =>
    withWorkflowCatalogMutationLock({
      action: generateUnlocked,
      rootDirectory,
    });
  const verify = async () => {
    await verifyLocalWorkflowCatalogAssemblies(rootDirectory);
    await verifyCanonicalWorkflowCatalogAssemblies(rootDirectory);
    const { verifyProjectWorkflowCatalog } =
      await import('./project-artifacts.js');
    await verifyProjectWorkflowCatalog();
  };

  return {
    help: () => console.log(workflowCatalogHelp),
    scaffold: async (exampleId: string) => {
      if (!exampleId) {
        throw new Error('Usage: workflow-catalog scaffold <example-id>');
      }

      await withWorkflowCatalogMutationLock({
        action: async () => {
          const { scaffoldDirectoryWorkflowCatalog } =
            await import('./scaffold.js');
          await scaffoldDirectoryWorkflowCatalog({
            exampleId,
            rootDirectory,
          });
        },
        rootDirectory,
      });
    },
    generate,
    verify,
    promote: async (exampleId: string, option?: string) => {
      if (!exampleId || (option && option !== '--dry-run')) {
        throw new Error(
          'Usage: workflow-catalog promote <example-id> [--dry-run]',
        );
      }

      if (option === '--dry-run') {
        const plan = await planDirectoryWorkflowCatalogPromotion({
          exampleId,
          rootDirectory,
        });
        console.log(JSON.stringify(plan, null, 2));
        return;
      }

      return executeDirectoryWorkflowCatalogPromotion({
        exampleId,
        generate: generateUnlocked,
        rootDirectory,
        verify,
      });
    },
    dev: () =>
      runCatalogDevelopmentEntry('scripts/workflow-catalog/dev-with-ui.ts'),
    worker: () => runCatalogDevelopmentEntry('scripts/workflow-catalog/dev.ts'),
  } satisfies Record<string, WorkflowCatalogCommand>;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const arguments_ = process.argv.slice(2);

  if (arguments_.length === 0 || arguments_.includes('--help')) {
    console.log(workflowCatalogHelp);
  } else {
    try {
      await runWorkflowCatalogCommand({
        arguments: arguments_,
        commands: createRuntimeCommands(),
        writeError: (message) => console.error(message),
        writeOutput: (message) => console.log(message),
      });
    } catch (error) {
      if (!(error instanceof ReportedWorkflowCatalogError)) {
        console.error(error instanceof Error ? error.message : error);
      }
      process.exitCode = 1;
    }
  }
}
