/**
 * Tests for the pure rendering-utility functions in constants.ts.
 *
 * These functions drive every pixel decision in the timeline SVG:
 * text placement, stroke color, category icon, and event-level geometry.
 * No component rendering required — the functions are plain TypeScript.
 *
 * Test coordinate system
 * ──────────────────────
 * canvasWidth = 1000, gutter = 48 (baseRadius*8)
 * timelineWidth = 1000 - 2*48 = 904
 *
 * timelineTextPosition thresholds (all measured in SVG x-coordinates):
 *   textToLeft  fires when firstPoint >  ½ * 904 = 452
 *   textToRight fires when lastPoint  <  ⅔ * 904 = 603  AND !isPending
 *   backdrop    fires when neither textToLeft nor textToRight is true
 */
import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

import {
  CategoryIcon,
  getCategoryStrokeColor,
  getStatusStrokeColor,
  isMiddleEvent,
  TimelineConfig,
  timelineTextPosition,
} from './constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { gutter, radius } = TimelineConfig;
// timelineWidth passed to timelineTextPosition:
const TW = 1000 - 2 * gutter; // 904

const Y = 48; // arbitrary row y
const HALF = TW / 2; // 452 — firstPoint threshold for textToLeft
const TWO_THIRDS = (2 / 3) * TW; // ≈ 603 — lastPoint threshold for textToRight

/** Build a minimal EventGroup for isMiddleEvent tests. */
function makeGroup(ids: string[]): EventGroup {
  return {
    id: ids[0],
    eventList: ids.map((id) => ({ id }) as never),
  } as unknown as EventGroup;
}

function tp(
  points: number[],
  isPending = false,
): ReturnType<typeof timelineTextPosition> {
  return timelineTextPosition(points, Y, TW, isPending, TimelineConfig);
}

// ---------------------------------------------------------------------------
// timelineTextPosition
// ---------------------------------------------------------------------------

describe('timelineTextPosition', () => {
  // -------------------------------------------------------------------------
  // Single-event groups
  // -------------------------------------------------------------------------

  describe('single dot — left side (firstPoint < ½ TW, lastPoint < ⅔ TW)', () => {
    // Both conditions false → textToRight = true
    it('anchor is "start" (text to right of dot)', () => {
      expect(tp([100]).textAnchor).toBe('start');
    });
    it('textIndex is 0 (label beside the only dot)', () => {
      expect(tp([100]).textIndex).toBe(0);
    });
    it('backdrop is false (label placed directly beside dot)', () => {
      expect(tp([100]).backdrop).toBe(false);
    });
  });

  describe('single dot — right side (firstPoint > ½ TW)', () => {
    it('anchor is "end" (text to left of dot)', () => {
      expect(tp([500]).textAnchor).toBe('end');
    });
    it('backdrop is false', () => {
      expect(tp([500]).backdrop).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Two-event groups
  // -------------------------------------------------------------------------

  describe('two-dot group — both in left half, lastPoint < ⅔ TW', () => {
    // textToRight = true → label after last dot
    const res = () => tp([100, 300]);

    it('anchor is "start"', () => {
      expect(res().textAnchor).toBe('start');
    });
    it('textIndex is 1 (after the last dot)', () => {
      expect(res().textIndex).toBe(1);
    });
    it('no backdrop', () => {
      expect(res().backdrop).toBe(false);
    });
  });

  describe('two-dot group — both on right side (firstPoint > ½ TW)', () => {
    it('anchor is "end"', () => {
      expect(tp([500, 600]).textAnchor).toBe('end');
    });
    it('no backdrop', () => {
      expect(tp([500, 600]).backdrop).toBe(false);
    });
  });

  describe('two-dot group — long span (lastPoint ≥ ⅔ TW), not pending', () => {
    // textToLeft=false, textToRight=false → backdrop
    const res = () => tp([100, 700]);

    it('backdrop is true', () => {
      expect(res().backdrop).toBe(true);
    });
    it('textIndex stays 0 (backdrop non-pending case)', () => {
      // The pending-specific branch only runs when isPending=true.
      expect(res().textIndex).toBe(0);
    });
  });

  describe('two-dot group — pending (isPending=true)', () => {
    // textToRight forced false by !isPending condition
    // Backdrop triggers; then checks gap vs remaining space.

    it('textIndex=1 when gap < remaining width after last dot', () => {
      // gap = 400-100 = 300, width-last = 904-400 = 504 → 300 < 504 → index=1
      expect(tp([100, 400], true).textIndex).toBe(1);
    });

    it('textIndex=0 when gap > remaining width after last dot', () => {
      // gap = 800-100 = 700, width-last = 904-800 = 104 → 700 > 104 → index=0
      expect(tp([100, 800], true).textIndex).toBe(0);
    });

    it('backdrop is true for pending groups', () => {
      expect(tp([100, 400], true).backdrop).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Three-event groups
  // -------------------------------------------------------------------------

  describe('three-dot group — short, all in left third (lastPoint < ⅔ TW)', () => {
    // textToRight=true → label after last dot
    const res = () => tp([100, 200, 300]);

    it('textIndex is 2 (after the last of three dots)', () => {
      expect(res().textIndex).toBe(2);
    });
    it('no backdrop', () => {
      expect(res().backdrop).toBe(false);
    });
  });

  describe('three-dot group — long span (lastPoint ≥ ⅔ TW), gap2 > gap1', () => {
    // [100, 200, 700]: gap1=100, gap2=500 → backdrop, textIndex=1
    const res = () => tp([100, 200, 700]);

    it('backdrop is true', () => {
      expect(res().backdrop).toBe(true);
    });
    it('textIndex is 1 (label after the dot preceding the larger gap)', () => {
      expect(res().textIndex).toBe(1);
    });
  });

  describe('three-dot group — long span, gap1 > gap2', () => {
    // [100, 500, 700]: gap1=400, gap2=200 → backdrop, textIndex stays 0
    const res = () => tp([100, 500, 700]);

    it('backdrop is true', () => {
      expect(res().backdrop).toBe(true);
    });
    it('textIndex is 0 (label at first dot because first gap is larger)', () => {
      expect(res().textIndex).toBe(0);
    });
  });

  describe('three-dot group — all on right side', () => {
    it('anchor is "end" when firstPoint > ½ TW', () => {
      expect(tp([500, 600, 700]).textAnchor).toBe('end');
    });
  });

  // -------------------------------------------------------------------------
  // textPosition coordinates sanity
  // -------------------------------------------------------------------------

  describe('textPosition coordinates', () => {
    it('textPosition y matches input y', () => {
      expect(tp([100]).textPosition[1]).toBe(Y);
    });

    it('textPosition x is to the right of the dot when anchor is "start"', () => {
      const { textPosition, textAnchor } = tp([100]);
      if (textAnchor === 'start') {
        expect(textPosition[0]).toBeGreaterThan(100);
      }
    });

    it('textPosition x is to the left of the dot when anchor is "end"', () => {
      const { textPosition, textAnchor } = tp([500]);
      if (textAnchor === 'end') {
        expect(textPosition[0]).toBeLessThan(500);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Half-width boundary
  // -------------------------------------------------------------------------

  describe('boundary at firstPoint = ½ TW', () => {
    it('exactly at threshold → textToLeft = false (not strictly greater)', () => {
      // firstPoint === HALF → condition is > not >= → textToLeft = false
      const { textAnchor } = tp([Math.floor(HALF)]);
      expect(textAnchor).toBe('start');
    });

    it('one pixel over threshold → textToLeft = true', () => {
      const { textAnchor } = tp([Math.ceil(HALF) + 1]);
      expect(textAnchor).toBe('end');
    });
  });
});

// ---------------------------------------------------------------------------
// getStatusStrokeColor — each classification maps to a distinct colour
// ---------------------------------------------------------------------------

describe('getStatusStrokeColor', () => {
  it.each([
    ['Completed', '#1ff1a5'],
    ['Failed', '#c71607'],
    ['Terminated', '#c71607'],
    ['Signaled', '#d300d8'],
    ['Fired', '#f8a208'],
    ['TimedOut', '#f97316'],
    ['Canceled', '#fed64b'],
    ['Running', '#3b82f6'],
    ['Delayed', '#fbbf24'],
  ] as const)('%s → %s', (status, expected) => {
    expect(getStatusStrokeColor(status)).toBe(expected);
  });

  it('unknown classification falls back to currentColor', () => {
    expect(getStatusStrokeColor('Unknown' as never)).toBe('currentColor');
  });

  it('Failed and Terminated share the same error color', () => {
    expect(getStatusStrokeColor('Failed')).toBe(
      getStatusStrokeColor('Terminated'),
    );
  });

  it('all known statuses return hex colors (start with #)', () => {
    for (const status of [
      'Completed',
      'Failed',
      'Signaled',
      'Fired',
      'TimedOut',
      'Canceled',
      'Running',
    ] as const) {
      expect(getStatusStrokeColor(status)).toMatch(/^#/);
    }
  });
});

// ---------------------------------------------------------------------------
// getCategoryStrokeColor — each category maps to a distinct colour
// ---------------------------------------------------------------------------

describe('getCategoryStrokeColor', () => {
  it.each([
    ['timer', '#fbbf24'],
    ['signal', '#d300d8'],
    ['activity', '#a78bfa'],
    ['workflow', '#ebebeb'],
    ['marker', '#ebebeb'],
    ['command', '#ebebeb'],
    ['child-workflow', '#0899B2'],
    ['update', '#FF9B70'],
    ['pending', '#a78bfa'],
    ['retry', '#FF9B70'],
  ] as const)('%s → %s', (category, expected) => {
    expect(getCategoryStrokeColor(category)).toBe(expected);
  });

  it('unknown category falls back to currentColor', () => {
    expect(getCategoryStrokeColor('other' as never)).toBe('currentColor');
  });

  it('activity and pending share the activity purple color', () => {
    expect(getCategoryStrokeColor('activity')).toBe(
      getCategoryStrokeColor('pending'),
    );
  });

  it('update and retry share the orange color', () => {
    expect(getCategoryStrokeColor('update')).toBe(
      getCategoryStrokeColor('retry'),
    );
  });
});

// ---------------------------------------------------------------------------
// CategoryIcon — maps every EventTypeCategory to the right icon name + title
// ---------------------------------------------------------------------------

describe('CategoryIcon', () => {
  it.each([
    ['activity', 'activity'],
    ['workflow', 'workflow'],
    ['signal', 'signal'],
    ['timer', 'retention'],
    ['child-workflow', 'relationship'],
    ['local-activity', 'feather'],
    ['update', 'update'],
    ['nexus', 'nexus'],
    ['other', 'terminal'],
  ] as const)('"%s" category uses icon "%s"', (category, iconName) => {
    expect(CategoryIcon[category].name).toBe(iconName);
  });

  it('every category has a non-empty title string', () => {
    for (const [cat, val] of Object.entries(CategoryIcon)) {
      expect(val.title.length, `title for "${cat}"`).toBeGreaterThan(0);
    }
  });

  it('every category has a non-empty icon name', () => {
    for (const [cat, val] of Object.entries(CategoryIcon)) {
      expect(val.name.length, `icon name for "${cat}"`).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// isMiddleEvent — true only for index-1 event in a 3-event group
// ---------------------------------------------------------------------------

describe('isMiddleEvent', () => {
  it('returns false for a single-event group', () => {
    const g = makeGroup(['5']);
    expect(isMiddleEvent({ id: '5' } as never, [g])).toBe(false);
  });

  it('returns false for the first event of a 2-event group', () => {
    const g = makeGroup(['5', '6']);
    expect(isMiddleEvent({ id: '5' } as never, [g])).toBe(false);
  });

  it('returns false for the second event of a 2-event group', () => {
    const g = makeGroup(['5', '6']);
    expect(isMiddleEvent({ id: '6' } as never, [g])).toBe(false);
  });

  it('returns false for the FIRST event of a 3-event group', () => {
    const g = makeGroup(['5', '6', '7']);
    expect(isMiddleEvent({ id: '5' } as never, [g])).toBe(false);
  });

  it('returns TRUE for the SECOND event of a 3-event group', () => {
    const g = makeGroup(['5', '6', '7']);
    expect(isMiddleEvent({ id: '6' } as never, [g])).toBe(true);
  });

  it('returns false for the THIRD event of a 3-event group', () => {
    const g = makeGroup(['5', '6', '7']);
    expect(isMiddleEvent({ id: '7' } as never, [g])).toBe(false);
  });

  it('event not in any group → false', () => {
    const g = makeGroup(['5', '6', '7']);
    expect(isMiddleEvent({ id: '99' } as never, [g])).toBe(false);
  });

  it('returns false for a 4-event group (only 3-event groups qualify)', () => {
    const g = makeGroup(['5', '6', '7', '8']);
    expect(isMiddleEvent({ id: '6' } as never, [g])).toBe(false);
  });

  it('works with a Map-shaped groups argument', () => {
    const g = makeGroup(['5', '6', '7']);
    const map = new Map([['6', g]]);
    expect(isMiddleEvent({ id: '6' } as never, map)).toBe(true);
    expect(isMiddleEvent({ id: '5' } as never, map)).toBe(false);
  });

  it('multiple groups — finds the right one', () => {
    const g1 = makeGroup(['1', '2', '3']);
    const g2 = makeGroup(['10', '11', '12']);
    expect(isMiddleEvent({ id: '11' } as never, [g1, g2])).toBe(true);
    expect(isMiddleEvent({ id: '2' } as never, [g1, g2])).toBe(true);
    expect(isMiddleEvent({ id: '12' } as never, [g1, g2])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TimelineConfig sanity — the constants used by every rendering calculation
// ---------------------------------------------------------------------------

describe('TimelineConfig', () => {
  it('all properties are positive', () => {
    expect(TimelineConfig.height).toBeGreaterThan(0);
    expect(TimelineConfig.gutter).toBeGreaterThan(0);
    expect(TimelineConfig.radius).toBeGreaterThan(0);
    expect(TimelineConfig.fontSizeRatio).toBeGreaterThan(0);
  });

  it('radius < gutter (dots never overflow the gutter margin)', () => {
    expect(TimelineConfig.radius).toBeLessThan(TimelineConfig.gutter);
  });

  it('height >= 2 * radius (rows never clip their dots vertically)', () => {
    expect(TimelineConfig.height).toBeGreaterThanOrEqual(
      2 * TimelineConfig.radius,
    );
  });

  it('height equals baseRadius * 4 (documents the formula)', () => {
    const baseRadius = 6;
    expect(TimelineConfig.height).toBe(baseRadius * 4);
    expect(TimelineConfig.radius).toBe(baseRadius * 1.5);
    expect(TimelineConfig.gutter).toBe(baseRadius * 8);
  });
});

// ---------------------------------------------------------------------------
// Gutter bounds — dots always within the visible canvas area
// ---------------------------------------------------------------------------

describe('gutter bounds', () => {
  const { radius: r, gutter: g } = TimelineConfig;

  it('radius is smaller than gutter (first/last dots never overlap the margin)', () => {
    expect(r).toBeLessThan(g);
  });

  it('a dot at gutter x still has its left edge inside the canvas (gutter - radius > 0)', () => {
    expect(g - r).toBeGreaterThan(0);
  });
});
