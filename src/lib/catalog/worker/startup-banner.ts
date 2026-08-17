const ESC = String.fromCharCode(27);
const RESET = `${ESC}[0m`;
const BOLD = `${ESC}[1m`;
const GREEN = `${ESC}[32m`;
const CYAN = `${ESC}[36m`;
const GRAY = `${ESC}[90m`;

export type CatalogBannerTarget = {
  id: string;
  namespace: string;
  taskQueue: string;
};

type BannerLine = {
  text: string;
  style: string;
};

const width = (value: string) => [...value].length;

export const supportsAnsiColor = ({
  isTTY,
  environment,
}: {
  isTTY: boolean;
  environment: Record<string, string | undefined>;
}): boolean => {
  if (environment.NO_COLOR) return false;
  if (environment.FORCE_COLOR) return true;
  return isTTY;
};

export const formatCatalogBanner = ({
  targets,
  origin = 'http://localhost:3000',
  color = false,
}: {
  targets: readonly CatalogBannerTarget[];
  origin?: string;
  color?: boolean;
}): string => {
  const namespaces = [...new Set(targets.map(({ namespace }) => namespace))];
  const lines: BannerLine[] = [
    { text: 'CATALOG READY', style: `${BOLD}${GREEN}` },
    { text: '', style: '' },
    ...namespaces.map((namespace) => ({
      text: `${origin}/namespaces/${namespace}/catalog`,
      style: CYAN,
    })),
    { text: '', style: '' },
    ...targets.map(({ id, namespace, taskQueue }) => ({
      text: `${id} → ${namespace} / ${taskQueue}`,
      style: '',
    })),
  ];
  const contentWidth = Math.max(...lines.map(({ text }) => width(text)));
  const paint = (value: string, style: string) =>
    color && style ? `${style}${value}${RESET}` : value;
  const frame = (value: string) => (color ? `${GRAY}${value}${RESET}` : value);
  const edge = frame('│');
  const framed = lines.map(
    ({ text, style }) =>
      `${edge}  ${paint(text, style)}${' '.repeat(contentWidth - width(text))}  ${edge}`,
  );

  return [
    '',
    frame(`╭──${'─'.repeat(contentWidth)}──╮`),
    ...framed,
    frame(`╰──${'─'.repeat(contentWidth)}──╯`),
    '',
  ].join('\n');
};
