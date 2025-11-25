import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

interface StrictError {
  type: 'ERROR';
  filename: string;
  start: { line: number; character: number };
  end: { line: number; character: number };
  message: string;
  code?: string;
  source?: string;
}

interface StrictErrorResult {
  success: boolean;
  totalErrors: number;
  errorsByFile: Record<string, StrictError[]>;
}

try {
  const result = spawnSync(
    'pnpm',
    [
      'svelte-check',
      '--tsconfig',
      './tsconfig.strict.json',
      '--output',
      'machine-verbose',
      '--threshold',
      'error',
    ],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5 * 60 * 1000,
      maxBuffer: 50 * 1024 * 1024,
      env: {
        ...process.env,
        VITE_TEMPORAL_UI_BUILD_TARGET: 'local',
      },
    },
  );

  const output = result.stdout || '';
  const lines = output.split('\n');

  const errorsByFile: Record<string, StrictError[]> = {};
  let totalErrors = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    const jsonMatch = line.match(/^\d+\s+({.+})$/);
    if (!jsonMatch) continue;

    try {
      const data = JSON.parse(jsonMatch[1]);

      if (data.type === 'ERROR') {
        const error: StrictError = {
          type: 'ERROR',
          filename: data.filename,
          start: data.start,
          end: data.end,
          message: data.message,
          code: data.code,
          source: data.source,
        };

        if (!errorsByFile[error.filename]) {
          errorsByFile[error.filename] = [];
        }

        errorsByFile[error.filename].push(error);
        totalErrors++;
      }
    } catch (parseError) {
      continue;
    }
  }

  const resultData: StrictErrorResult = {
    success: true,
    totalErrors,
    errorsByFile,
  };

  console.log(JSON.stringify(resultData));
  process.exit(0);
} catch (error) {
  console.error('Failed to run svelte-check:', error);

  const errorResult: StrictErrorResult = {
    success: false,
    totalErrors: 0,
    errorsByFile: {},
  };

  console.log(JSON.stringify(errorResult));
  process.exit(0);
}
