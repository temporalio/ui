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

export function pickTickInterval(zoom: number): number {
  for (const ms of TICK_LEVELS_MS) {
    if (ms * zoom >= MIN_TICK_PX) return ms;
  }
  return TICK_LEVELS_MS[TICK_LEVELS_MS.length - 1];
}

export function formatTickLabel(offsetMs: number, intervalMs: number): string {
  if (intervalMs < 1_000) return `${offsetMs}ms`;
  if (intervalMs < 60_000) return `${Math.round(offsetMs / 1_000)}s`;
  if (intervalMs < 3_600_000) return `${Math.floor(offsetMs / 60_000)}m`;
  if (intervalMs < 86_400_000) {
    const h = Math.floor(offsetMs / 3_600_000);
    const m = Math.floor((offsetMs % 3_600_000) / 60_000);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(offsetMs / 86_400_000);
  const h = Math.floor((offsetMs % 86_400_000) / 3_600_000);
  return h ? `${d}d ${h}h` : `${d}d`;
}
