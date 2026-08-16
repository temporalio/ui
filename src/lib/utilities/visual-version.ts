import { BROWSER } from 'esm-env';

export type VisualVersion = 'legacy' | 'v2';

const isVisualVersion = (value: unknown): value is VisualVersion =>
  value === 'legacy' || value === 'v2';

export const resolveVisualVersion = ({
  configured = import.meta.env.VITE_TEMPORAL_UI_VISUAL_VERSION,
  query,
  stored,
}: {
  configured?: string;
  query?: string | null;
  stored?: string | null;
} = {}): VisualVersion => {
  if (isVisualVersion(query)) return query;
  if (isVisualVersion(stored)) return stored;
  if (stored === '"legacy"') return 'legacy';
  if (stored === '"v2"') return 'v2';
  if (isVisualVersion(configured)) return configured;
  return 'v2';
};

export const applyVisualVersion = (): VisualVersion => {
  if (!BROWSER) return resolveVisualVersion();

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem('visual version');
  } catch {
    // Storage can be unavailable in hardened browser contexts.
  }

  const version = resolveVisualVersion({
    query: new URL(window.location.href).searchParams.get('visual'),
    stored,
  });

  document.documentElement.dataset.visualVersion = version;
  document.body.dataset.visualVersion = version;
  return version;
};
