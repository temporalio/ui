/**
 * Shared BitmapFont installation — idempotent, safe to call from multiple renderers.
 * BitmapFont names are global in PixiJS; this module ensures they're installed exactly once.
 */
import 'pixi.js/unsafe-eval';
import { BitmapFont, BitmapFontManager } from 'pixi.js';

export const FONT_EVENT = 'tl-event';
export const FONT_RULER = 'tl-ruler';

const MONO = '"SF Mono", ui-monospace, Menlo, monospace';
let installed = false;
let pendingExtra = '';

/**
 * Register non-ASCII characters found in event data so they are included in
 * the BitmapFont atlas when it is first installed.  Must be called before the
 * first render() tick (i.e. from loadEvents()).  Calls after installation are
 * silently ignored — the atlas is baked once and cannot be extended cheaply.
 */
export function registerFontChars(chars: string): void {
  if (installed) return;
  pendingExtra += chars;
}

/**
 * Install BitmapFont atlases for event and ruler labels.  Deferred to the
 * first render() tick so atlas generation stays off the app.init() critical
 * path.  The charset is ASCII plus any extra characters registered via
 * registerFontChars() — typically just the handful of accented/special chars
 * that actually appear in event names rather than the full Latin Extended range.
 */
export function ensureBitmapFonts(): void {
  if (installed) return;
  installed = true;
  // Cap at 2× — same reasoning as the canvas resolution cap in PixiRenderer.
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  // pendingExtra is pre-filtered to non-ASCII chars by registerFontChars callers.
  // BitmapFontManager.ASCII is string[][] (range pairs); spread it and append the
  // extra chars as a plain string so BitmapFont.install sees a (string | string[])[].
  const extra = [...new Set(pendingExtra)].join('');
  const chars = extra
    ? ([...BitmapFontManager.ASCII, extra] as (string | string[])[])
    : BitmapFontManager.ASCII;
  BitmapFont.install({
    name: FONT_EVENT,
    style: { fontFamily: MONO, fontSize: 10, fill: '#ffffff' },
    chars,
    resolution: dpr,
  });
  BitmapFont.install({
    name: FONT_RULER,
    style: { fontFamily: MONO, fontSize: 10, fill: '#64748b' },
    chars,
    resolution: dpr,
  });
}

// ── Tick interval helpers (shared between main ruler and child ruler) ─────────

export type TimeScale = 'auto' | 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

const MIN_TICK_PX = 90;
export const TICK_LEVELS_MS = [
  1,
  5,
  10,
  50,
  100,
  500,
  1_000,
  5_000,
  15_000,
  30_000,
  60_000,
  5 * 60_000,
  15 * 60_000,
  30 * 60_000,
  3_600_000,
  6 * 3_600_000,
  12 * 3_600_000,
  24 * 3_600_000,
  7 * 24 * 3_600_000,
];

const SCALE_TICKS: Record<Exclude<TimeScale, 'auto'>, number[]> = {
  ms: [1, 5, 10, 50, 100, 500],
  s: [1_000, 5_000, 15_000, 30_000],
  m: [60_000, 5 * 60_000, 15 * 60_000, 30 * 60_000],
  h: [3_600_000, 6 * 3_600_000, 12 * 3_600_000],
  d: [86_400_000],
  w: [7 * 86_400_000],
};

export function pickTickInterval(
  zoom: number,
  scale: TimeScale = 'auto',
): number {
  if (scale === 'auto') {
    for (const ms of TICK_LEVELS_MS) {
      if (ms * zoom >= MIN_TICK_PX) return ms;
    }
    return TICK_LEVELS_MS[TICK_LEVELS_MS.length - 1];
  }
  const levels = SCALE_TICKS[scale];
  for (const ms of levels) {
    if (ms * zoom >= MIN_TICK_PX) return ms;
  }
  return levels[levels.length - 1];
}

/** The effective unit auto-selects based on the interval. Used by the UI to
 *  show which unit is active when scale='auto'. */
export function autoScaleUnit(intervalMs: number): Exclude<TimeScale, 'auto'> {
  if (intervalMs < 1_000) return 'ms';
  if (intervalMs < 60_000) return 's';
  if (intervalMs < 3_600_000) return 'm';
  if (intervalMs < 86_400_000) return 'h';
  if (intervalMs < 7 * 86_400_000) return 'd';
  return 'w';
}

export function formatTickLabel(
  offsetMs: number,
  intervalMs: number,
  scale: TimeScale = 'auto',
): string {
  const unit: Exclude<TimeScale, 'auto'> =
    scale === 'auto' ? autoScaleUnit(intervalMs) : scale;

  switch (unit) {
    case 'ms': {
      // In auto mode prefer seconds for offsets >= 1s to avoid ugly "18500ms"
      if (scale === 'auto' && Math.abs(offsetMs) >= 1_000) {
        return `${(offsetMs / 1_000).toFixed(1)}s`;
      }
      return `${Math.round(offsetMs)}ms`;
    }
    case 's':
      return `${Math.round(offsetMs / 1_000)}s`;
    case 'm':
      return `${Math.floor(offsetMs / 60_000)}m`;
    case 'h': {
      const h = Math.floor(offsetMs / 3_600_000);
      const m = Math.floor((offsetMs % 3_600_000) / 60_000);
      return m ? `${h}h ${m}m` : `${h}h`;
    }
    case 'd': {
      const d = Math.floor(offsetMs / 86_400_000);
      const h = Math.floor((offsetMs % 86_400_000) / 3_600_000);
      return h ? `${d}d ${h}h` : `${d}d`;
    }
    case 'w': {
      const w = Math.floor(offsetMs / (7 * 86_400_000));
      return `${w}w`;
    }
  }
}
