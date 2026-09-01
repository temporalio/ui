import { readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import glob from 'fast-glob';

import {
  colorTheme,
  type ColorThemeValue,
  fixedColorNames,
  semanticColorVariableNames,
} from '../../src/lib/theme/tailwind-colors';
import { getProjectRoot } from '../get-project-root';

type ViolationKind =
  | 'legacy-component'
  | 'legacy-css-variable'
  | 'legacy-tailwind-color';

const LEGACY_CSS_VARIABLE: ViolationKind = 'legacy-css-variable';

type Violation = {
  path: string;
  line: number;
  column: number;
  kind: ViolationKind;
  token: string;
};

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

const TAILWIND_DEFAULT_PALETTES = [
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

const TAILWIND_DEFAULT_SHADES = new Set([
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

const RETIRED_SEMANTIC_COLORS = new Set([
  'action-hover-overlay',
  'action-press-overlay',
  'action-brand-hover',
  'action-brand-press',
  'actions-hover-overlay',
  'actions-press-overlay',
  'actions-brand-hover',
  'actions-brand-press',
  'overlay-primary',
  'overlay-secondary',
  'overlay-tertiary',
  'overlay-information',
  'overlay-success',
  'overlay-warning',
  'overlay-danger',
  'overlay-error',
  'overlay-accent',
  'overlay-backdrop',
  'static-text-info',
  'static-text-success',
  'static-text-warning',
  'static-text-danger',
  'surface-static-neutral',
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
const CSS_VARIABLE_PATTERN = /--color-[a-z0-9-]+/g;
const LEGACY_COMPONENT_PATTERN = new RegExp(
  `(?<![A-Za-z0-9_-])(?:${LEGACY_COMPONENTS.join('|')})(?![A-Za-z0-9_-])`,
  'g',
);
const TAILWIND_COLOR_PATTERN =
  /(?<![A-Za-z0-9_-])!?(ring-offset|border-(?:x|y|s|e|t|r|b|l)|text|bg|border|divide|ring|placeholder|caret|decoration|outline|accent|fill|stroke|from|via|to|shadow)-([A-Za-z0-9_-]+)(?:\/[A-Za-z0-9_.-]+)?(?![A-Za-z0-9_-])/g;

const COLOR_THEME_PROPERTIES: Readonly<Record<string, ColorThemeValue>> =
  colorTheme;

const UTILITY_THEME_PROPERTIES: Readonly<Record<string, string>> = {
  accent: 'accentColor',
  bg: 'backgroundColor',
  border: 'borderColor',
  caret: 'caretColor',
  decoration: 'textDecorationColor',
  divide: 'divideColor',
  fill: 'fill',
  from: 'gradientColorStops',
  outline: 'outlineColor',
  placeholder: 'placeholderColor',
  ring: 'ringColor',
  'ring-offset': 'ringOffsetColor',
  shadow: 'boxShadowColor',
  stroke: 'stroke',
  text: 'textColor',
  to: 'gradientColorStops',
  via: 'gradientColorStops',
};

const NON_COLOR_UTILITY_VALUES: Readonly<Record<string, ReadonlySet<string>>> =
  {
    bg: new Set(['none']),
    border: new Set(['2', 'none']),
    decoration: new Set(['auto', 'from-font']),
    outline: new Set(['none']),
    ring: new Set(['2']),
    'ring-offset': new Set(['2']),
    shadow: new Set(['none']),
    stroke: new Set(['2']),
    text: new Set(['sm']),
  };

const flattenColorNames = (value: ColorThemeValue, prefix = ''): string[] => {
  if (typeof value === 'string') return prefix ? [prefix] : [];

  return Object.entries(value).flatMap(([name, nestedValue]) => {
    const nestedPrefix =
      name === 'DEFAULT' ? prefix : prefix ? `${prefix}-${name}` : name;
    return flattenColorNames(nestedValue, nestedPrefix);
  });
};

const propertyColorNames = Object.fromEntries(
  Object.entries(UTILITY_THEME_PROPERTIES).map(([utility, property]) => [
    utility,
    new Set(flattenColorNames(COLOR_THEME_PROPERTIES[property] || {})),
  ]),
);

const allApiColorNames = new Set(
  Object.values(propertyColorNames).flatMap((names) => [...names]),
);
const duplicateContentFixedColorNames = new Set(
  fixedColorNames.map((name) => `content-${name}`),
);
const allowedCssVariables = new Set(semanticColorVariableNames);

const normalizeUtility = (utility: string): string =>
  utility.startsWith('border-') ? 'border' : utility;

const isTailwindDefaultPaletteColor = (color: string): boolean =>
  TAILWIND_DEFAULT_PALETTES.some((palette) => {
    if (color === palette) return true;
    if (!color.startsWith(`${palette}-`)) return false;
    return TAILWIND_DEFAULT_SHADES.has(color.slice(palette.length + 1));
  });

const isInvalidTailwindColor = (utility: string, color: string): boolean => {
  const normalizedUtility = normalizeUtility(utility);
  const allowedColors = propertyColorNames[normalizedUtility];

  if (color.startsWith('io-')) return true;
  if (RETIRED_SEMANTIC_COLORS.has(color)) return true;
  if (NON_COLOR_UTILITY_VALUES[normalizedUtility]?.has(color)) return false;
  if (allowedColors?.has(color)) return false;
  if (duplicateContentFixedColorNames.has(color)) return true;
  if (allApiColorNames.has(color)) return true;
  if (LEGACY_NAMED_COLORS.has(color)) return true;
  if (isTailwindDefaultPaletteColor(color)) return true;
  return LEGACY_SEMANTIC_COLORS[normalizedUtility]?.has(color) || false;
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
  const cssVariableViolations = Array.from(
    line.matchAll(CSS_VARIABLE_PATTERN),
    (match): Violation => ({
      path: relative(projectRoot, file),
      line: lineNumber,
      column: (match.index || 0) + 1,
      kind: LEGACY_CSS_VARIABLE,
      token: match[0],
    }),
  ).filter((violation) => !allowedCssVariables.has(violation.token));

  const violations = [
    ...cssVariableViolations,
    ...Array.from(line.matchAll(LEGACY_COMPONENT_PATTERN), (match) =>
      toViolation(projectRoot, file, lineNumber, match, 'legacy-component'),
    ),
  ];

  for (const match of line.matchAll(TAILWIND_COLOR_PATTERN)) {
    const utility = match[1] || '';
    const color = match[2] || '';
    if (isInvalidTailwindColor(utility, color)) {
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
      '**/theme/io/themes/**',
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
    console.log(`No color API violations found in ${auditRoot}.`);
    return;
  }

  console.error(
    `Found ${violations.length} color API violation${violations.length === 1 ? '' : 's'} in ${auditRoot}:`,
  );
  for (const violation of violations) {
    console.error(
      `${violation.path}:${violation.line}:${violation.column} [${violation.kind}] ${violation.token}`,
    );
  }
  console.error(
    'Use the property-aware unprefixed color API, generated --color-* variables, or direct arbitrary CSS colors.',
  );
  process.exitCode = 1;
};

await audit();
