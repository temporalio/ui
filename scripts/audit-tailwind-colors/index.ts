import { readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import glob from 'fast-glob';

import { getProjectRoot } from '../get-project-root';

type ViolationKind =
  | 'legacy-component'
  | 'legacy-css-variable'
  | 'legacy-tailwind-color';

type Violation = {
  path: string;
  line: number;
  column: number;
  kind: ViolationKind;
  token: string;
};

const ALLOWED_KEYWORD_COLORS = new Set(['current', 'inherit', 'transparent']);

const LEGACY_NAMED_COLORS = new Set([
  'white',
  'off-white',
  'black',
  'space-black',
  'off-black',
  'code-black',
  'mint',
  'brand',
]);

const LEGACY_PALETTES = [
  'amber',
  'blue',
  'cyan',
  'emerald',
  'fuchsia',
  'gray',
  'green',
  'indigo',
  'lime',
  'neutral',
  'orange',
  'pink',
  'purple',
  'red',
  'rose',
  'sky',
  'slate',
  'stone',
  'teal',
  'violet',
  'yellow',
  'zinc',
];

const LEGACY_SHADES = new Set([
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
]);

const LEGACY_SEMANTIC_COLORS: Readonly<Record<string, ReadonlySet<string>>> = {
  bg: new Set([
    'primary',
    'secondary',
    'inverse',
    'subtle',
    'interactive',
    'interactive-hover',
    'interactive-active',
    'interactive-error',
    'interactive-secondary-hover',
    'interactive-secondary-active',
    'interactive-table-hover',
    'information',
    'success',
    'warning',
    'danger',
    'code-block',
  ]),
  border: new Set([
    'primary',
    'secondary',
    'subtle',
    'interactive',
    'interactive-hover',
    'inverse',
    'table',
    'table-related-hover',
    'information',
    'success',
    'warning',
    'danger',
  ]),
  ring: new Set(['primary', 'danger', 'success', 'brand']),
  text: new Set([
    'primary',
    'secondary',
    'subtle',
    'inverse',
    'brand',
    'danger',
    'information',
    'success',
    'warning',
  ]),
  caret: new Set(['danger']),
};

const LEGACY_COMPONENTS = [
  'surface-background',
  'surface-primary',
  'surface-secondary',
  'surface-interactive',
  'surface-interactive-secondary',
  'surface-interactive-danger',
  'surface-interactive-ghost',
  'surface-information',
  'surface-inverse',
  'surface-subtle',
  'surface-table',
  'surface-table-header',
  'surface-warning',
  'surface-danger',
  'surface-table-related-hover',
  'surface-black',
];

const SOURCE_PATTERN =
  '**/*.{svelte,ts,tsx,mts,cts,js,jsx,mjs,cjs,css,postcss,html,md,mdx}';
const CSS_VARIABLE_PATTERN = /--color-(?!io-)[a-z0-9-]+/g;
const LEGACY_COMPONENT_PATTERN = new RegExp(
  `(?<![A-Za-z0-9_-])(?:${LEGACY_COMPONENTS.join('|')})(?![A-Za-z0-9_-])`,
  'g',
);
const TAILWIND_COLOR_PATTERN =
  /(?<![A-Za-z0-9_-])!?(ring-offset|border-(?:x|y|s|e|t|r|b|l)|text|bg|border|divide|ring|placeholder|caret|decoration|outline|accent|fill|stroke|from|via|to|shadow)-([A-Za-z0-9_-]+)(?:\/[A-Za-z0-9_.-]+)?(?![A-Za-z0-9_-])/g;

const normalizeUtility = (utility: string): string =>
  utility.startsWith('border-') ? 'border' : utility;

const isLegacyPaletteColor = (color: string): boolean =>
  LEGACY_PALETTES.some((palette) => {
    if (color === palette) return true;
    if (!color.startsWith(`${palette}-`)) return false;
    return LEGACY_SHADES.has(color.slice(palette.length + 1));
  });

const isLegacyTailwindColor = (utility: string, color: string): boolean => {
  if (color.startsWith('io-')) return false;
  if (ALLOWED_KEYWORD_COLORS.has(color)) return false;
  if (LEGACY_NAMED_COLORS.has(color)) return true;
  if (isLegacyPaletteColor(color)) return true;
  return LEGACY_SEMANTIC_COLORS[normalizeUtility(utility)]?.has(color) || false;
};

const toViolation = (
  projectRoot: string,
  file: string,
  line: number,
  match: RegExpMatchArray,
  kind: ViolationKind,
): Violation => ({
  path: relative(projectRoot, file),
  line,
  column: (match.index || 0) + 1,
  kind,
  token: match[0],
});

const findLineViolations = (
  projectRoot: string,
  file: string,
  line: string,
  lineNumber: number,
): Violation[] => {
  const violations = [
    ...Array.from(line.matchAll(CSS_VARIABLE_PATTERN), (match) =>
      toViolation(projectRoot, file, lineNumber, match, 'legacy-css-variable'),
    ),
    ...Array.from(line.matchAll(LEGACY_COMPONENT_PATTERN), (match) =>
      toViolation(projectRoot, file, lineNumber, match, 'legacy-component'),
    ),
  ];

  for (const match of line.matchAll(TAILWIND_COLOR_PATTERN)) {
    const utility = match[1] || '';
    const color = match[2] || '';
    if (isLegacyTailwindColor(utility, color)) {
      violations.push(
        toViolation(
          projectRoot,
          file,
          lineNumber,
          match,
          'legacy-tailwind-color',
        ),
      );
    }
  }

  return violations;
};

const findViolations = async (
  projectRoot: string,
  auditRoot: string,
): Promise<Violation[]> => {
  const files = await glob(SOURCE_PATTERN, {
    absolute: true,
    cwd: auditRoot,
    ignore: [
      '**/.catalog-ui-authoring*/**',
      '**/.git/**',
      '**/.svelte-kit/**',
      '**/build/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/scripts/audit-tailwind-colors/**',
      '**/storybook-static/**',
      'server/**',
      '**/utilities/oidc-server/**',
    ],
    onlyFiles: true,
  });
  const violations: Violation[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const [index, line] of content.split('\n').entries()) {
      violations.push(
        ...findLineViolations(projectRoot, file, line, index + 1),
      );
    }
  }

  return violations.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.line - right.line ||
      left.column - right.column,
  );
};

const audit = async (): Promise<void> => {
  const projectRoot = getProjectRoot();
  const target = process.argv.slice(2).find((argument) => argument !== '--');
  const auditRoot = resolve(target || resolve(projectRoot, 'src'));

  if (!(await stat(auditRoot)).isDirectory()) {
    throw new Error(`Audit target is not a directory: ${auditRoot}`);
  }

  const violations = await findViolations(projectRoot, auditRoot);

  if (!violations.length) {
    console.log(`No legacy Tailwind colors found in ${auditRoot}.`);
    return;
  }

  console.error(
    `Found ${violations.length} legacy color violation${violations.length === 1 ? '' : 's'} in ${auditRoot}:`,
  );
  for (const violation of violations) {
    console.error(
      `${violation.path}:${violation.line}:${violation.column} [${violation.kind}] ${violation.token}`,
    );
  }
  console.error(
    'Use io-* Tailwind colors, --color-io-* variables, or direct arbitrary CSS colors.',
  );
  process.exitCode = 1;
};

await audit();
