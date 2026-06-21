import { describe, expect, it } from 'vitest';

import type { ScrollSnapConfig } from './scroll-snap';
import {
  calcSnapScrollY,
  DEFAULT_SCROLL_SNAP_CONFIG,
  SNAP_COOLDOWN_MS,
} from './scroll-snap';

const ROW_H = 32;
const VISIBLE_H = 800; // event-area height (canvas minus ruler)
const TOTAL_TRACKS = 200;

describe('DEFAULT_SCROLL_SNAP_CONFIG', () => {
  it('has eventIndex=4, topYFrac=0.25, botYFrac=0.75', () => {
    expect(DEFAULT_SCROLL_SNAP_CONFIG).toEqual({
      eventIndex: 4,
      topYFrac: 0.25,
      botYFrac: 0.75,
    });
  });
});

describe('SNAP_COOLDOWN_MS', () => {
  it('is at least 100ms so the snap fires after inertia trailing events', () => {
    expect(SNAP_COOLDOWN_MS).toBeGreaterThanOrEqual(100);
  });

  it('is at most 300ms so the snap feels like a natural settle not a lag', () => {
    expect(SNAP_COOLDOWN_MS).toBeLessThanOrEqual(300);
  });
});

describe('calcSnapScrollY – scroll UP', () => {
  it('positions the Nth visible track from top at topYFrac', () => {
    // currentScrollY=0 → topTrack=0 → anchorTrack=0+3=3
    // newScrollY = 3*32 - 0.25*800 = 96 - 200 = -104 (caller clamps to 0)
    expect(calcSnapScrollY('up', 0, VISIBLE_H, ROW_H, TOTAL_TRACKS)).toBe(-104);
  });

  it('computes correct anchor at mid-scroll position', () => {
    // currentScrollY=640 → topTrack=20 → anchorTrack=20+3=23
    // newScrollY = 23*32 - 0.25*800 = 736 - 200 = 536
    const result = calcSnapScrollY('up', 640, VISIBLE_H, ROW_H, TOTAL_TRACKS);
    expect(result).toBe(536);
  });

  it('never returns an anchor track below 0', () => {
    // topTrack=2, eventIndex=4 → anchorTrack = max(0, 2+3) = 5
    // (already ≥ 0; floor(2*32/32)=2, 2+3=5)
    const result = calcSnapScrollY(
      'up',
      2 * ROW_H,
      VISIBLE_H,
      ROW_H,
      TOTAL_TRACKS,
    );
    expect(result).toBe(5 * ROW_H - 0.25 * VISIBLE_H);
  });

  it('respects a custom eventIndex and topYFrac', () => {
    const config: ScrollSnapConfig = {
      eventIndex: 2,
      topYFrac: 0.3,
      botYFrac: 0.7,
    };
    // currentScrollY=320 → topTrack=10 → anchorTrack=10+1=11
    // newScrollY = 11*32 - 0.3*800 = 352 - 240 = 112
    expect(
      calcSnapScrollY('up', 320, VISIBLE_H, ROW_H, TOTAL_TRACKS, config),
    ).toBe(112);
  });

  it('produces a small correction (≤ eventIndex × rowH from current position)', () => {
    // The snap should never move the view by more than eventIndex * rowH
    // (it only aligns within the current visible range).
    const scrollY = 50 * ROW_H;
    const result = calcSnapScrollY(
      'up',
      scrollY,
      VISIBLE_H,
      ROW_H,
      TOTAL_TRACKS,
    );
    const maxExpectedShift =
      DEFAULT_SCROLL_SNAP_CONFIG.eventIndex * ROW_H + 0.25 * VISIBLE_H;
    expect(Math.abs(result - scrollY)).toBeLessThanOrEqual(maxExpectedShift);
  });

  it('is consistent across scroll positions (constant correction)', () => {
    // correction ≈ topYFrac * visibleH - (eventIndex-1) * rowH
    const s1 = 40 * ROW_H;
    const s2 = 100 * ROW_H;
    const c1 = calcSnapScrollY('up', s1, VISIBLE_H, ROW_H, TOTAL_TRACKS) - s1;
    const c2 = calcSnapScrollY('up', s2, VISIBLE_H, ROW_H, TOTAL_TRACKS) - s2;
    expect(c1).toBeCloseTo(c2, 0);
  });
});

describe('calcSnapScrollY – scroll DOWN', () => {
  it('positions the Nth visible track from bottom at botYFrac', () => {
    // currentScrollY=0 → bottomTrack=floor(800/32)=25 → anchorTrack=max(0,25-3)=22
    // newScrollY = 22*32 - 0.75*800 = 704 - 600 = 104
    expect(calcSnapScrollY('down', 0, VISIBLE_H, ROW_H, TOTAL_TRACKS)).toBe(
      104,
    );
  });

  it('computes correct anchor at mid-scroll position', () => {
    // currentScrollY=960 → bottomTrack=floor(1760/32)=55 → anchorTrack=max(0,55-3)=52
    // newScrollY = 52*32 - 0.75*800 = 1664 - 600 = 1064
    const result = calcSnapScrollY('down', 960, VISIBLE_H, ROW_H, TOTAL_TRACKS);
    expect(result).toBe(1064);
  });

  it('clamps anchor to totalTracks-1', () => {
    // highScroll=198*32=6336 → bottomTrack=floor(7136/32)=223 → anchorTrack=min(199, 220)=199
    const highScroll = 198 * ROW_H;
    const result = calcSnapScrollY(
      'down',
      highScroll,
      VISIBLE_H,
      ROW_H,
      TOTAL_TRACKS,
    );
    const expected = (TOTAL_TRACKS - 1) * ROW_H - 0.75 * VISIBLE_H;
    expect(result).toBe(expected);
  });

  it('respects a custom eventIndex and botYFrac', () => {
    const config: ScrollSnapConfig = {
      eventIndex: 1,
      topYFrac: 0.25,
      botYFrac: 0.5,
    };
    // currentScrollY=0 → bottomTrack=25 → anchorTrack=max(0, 25-0)=25
    // newScrollY = 25*32 - 0.5*800 = 800 - 400 = 400
    expect(
      calcSnapScrollY('down', 0, VISIBLE_H, ROW_H, TOTAL_TRACKS, config),
    ).toBe(400);
  });

  it('produces a small correction (≤ eventIndex × rowH from current position)', () => {
    const scrollY = 50 * ROW_H;
    const result = calcSnapScrollY(
      'down',
      scrollY,
      VISIBLE_H,
      ROW_H,
      TOTAL_TRACKS,
    );
    const maxExpectedShift =
      DEFAULT_SCROLL_SNAP_CONFIG.eventIndex * ROW_H + 0.25 * VISIBLE_H;
    expect(Math.abs(result - scrollY)).toBeLessThanOrEqual(maxExpectedShift);
  });

  it('is consistent across scroll positions (constant correction)', () => {
    const s1 = 40 * ROW_H;
    const s2 = 80 * ROW_H;
    const c1 = calcSnapScrollY('down', s1, VISIBLE_H, ROW_H, TOTAL_TRACKS) - s1;
    const c2 = calcSnapScrollY('down', s2, VISIBLE_H, ROW_H, TOTAL_TRACKS) - s2;
    expect(c1).toBeCloseTo(c2, 0);
  });
});

describe('calcSnapScrollY – edge cases', () => {
  it('handles a single-track timeline without throwing', () => {
    // anchorTrack = min(0, max(0, 25-3)) = 0; newScrollY = 0 - 0.75*800 = -600
    const result = calcSnapScrollY('down', 0, VISIBLE_H, ROW_H, 1);
    expect(result).toBe(-600);
  });

  it('handles rowH=1 (degenerate) without throwing', () => {
    expect(() =>
      calcSnapScrollY('up', 0, VISIBLE_H, 1, TOTAL_TRACKS),
    ).not.toThrow();
  });

  it('snap UP at scrollY=0 returns negative (caller clamps to 0)', () => {
    const upAt0 = calcSnapScrollY('up', 0, VISIBLE_H, ROW_H, TOTAL_TRACKS);
    expect(upAt0).toBeLessThan(0);
  });

  it('snap DOWN at scrollY=0 returns positive (moves view down slightly)', () => {
    const downAt0 = calcSnapScrollY('down', 0, VISIBLE_H, ROW_H, TOTAL_TRACKS);
    expect(downAt0).toBeGreaterThan(0);
  });

  it('anchor track is always within the current visible range', () => {
    const scrollY = 50 * ROW_H;
    const topTrack = Math.floor(scrollY / ROW_H);
    const bottomTrack = Math.floor((scrollY + VISIBLE_H) / ROW_H);

    // UP anchor: topTrack + 3 (within visible range)
    const upResult = calcSnapScrollY(
      'up',
      scrollY,
      VISIBLE_H,
      ROW_H,
      TOTAL_TRACKS,
    );
    const upAnchorTrack = (upResult + 0.25 * VISIBLE_H) / ROW_H;
    expect(upAnchorTrack).toBeGreaterThanOrEqual(topTrack);
    expect(upAnchorTrack).toBeLessThanOrEqual(bottomTrack);

    // DOWN anchor: bottomTrack - 3 (within visible range)
    const downResult = calcSnapScrollY(
      'down',
      scrollY,
      VISIBLE_H,
      ROW_H,
      TOTAL_TRACKS,
    );
    const downAnchorTrack = (downResult + 0.75 * VISIBLE_H) / ROW_H;
    expect(downAnchorTrack).toBeGreaterThanOrEqual(topTrack);
    expect(downAnchorTrack).toBeLessThanOrEqual(bottomTrack);
  });
});
