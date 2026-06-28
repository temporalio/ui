import { describe, expect, it } from 'vitest';

import { gatherGutterTracks } from './gutter-culling';

const RULER_H = 24;
const TRACK_H = 26;
const ROW_SIZE = 32; // trackH(28) + gap(4)
const SCREEN_H = 950;

/** scrollY=0 → containerY=RULER_H so track 0 starts at y=RULER_H. */
const containerYForScroll = (scrollY: number) => RULER_H - scrollY;

describe('gatherGutterTracks', () => {
  it('returns empty arrays when all tracks are visible', () => {
    // 10 tracks × 32px = 320px, all inside [24, 950]
    const result = gatherGutterTracks(
      10,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    expect(result.aboveTrackIdxs).toHaveLength(0);
    expect(result.belowTrackIdxs).toHaveLength(0);
  });

  it('returns empty arrays when there are no tracks', () => {
    const result = gatherGutterTracks(
      0,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    expect(result.aboveTrackIdxs).toHaveLength(0);
    expect(result.belowTrackIdxs).toHaveLength(0);
  });

  it('puts off-screen-below tracks in belowTrackIdxs at scrollY=0', () => {
    // 100 tracks: first few visible, rest below
    const result = gatherGutterTracks(
      100,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    expect(result.aboveTrackIdxs).toHaveLength(0);
    // Track t is below when containerY + t * ROW_SIZE > SCREEN_H
    // RULER_H + t * 32 > 950 → t > 926/32 ≈ 28.9 → t >= 29
    expect(result.belowTrackIdxs.length).toBeGreaterThan(0);
    expect(result.belowTrackIdxs.every((t) => t >= 29)).toBe(true);
  });

  it('puts off-screen-above tracks in aboveTrackIdxs when scrolled down', () => {
    // Scroll past 50 tracks worth: scrollY = 50 * 32 = 1600
    const scrollY = 50 * ROW_SIZE;
    const result = gatherGutterTracks(
      100,
      containerYForScroll(scrollY),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    // Tracks 0..49 are above the viewport
    expect(result.aboveTrackIdxs.length).toBeGreaterThan(0);
    expect(result.aboveTrackIdxs.every((t) => t < 50)).toBe(true);
  });

  it('caps the number of pins at maxPins per gutter', () => {
    // 1000 tracks — most will be below at scrollY=0
    const MAX = 30;
    const result = gatherGutterTracks(
      1000,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      MAX,
    );
    expect(result.belowTrackIdxs.length).toBeLessThanOrEqual(MAX);
    expect(result.aboveTrackIdxs.length).toBeLessThanOrEqual(MAX);
  });

  it('selects the CLOSEST below-tracks (lowest track indices past viewport)', () => {
    const MAX = 5;
    // 100 tracks, scrollY=0 → tracks 29-99 are below (71 tracks)
    // With MAX=5, should return the 5 closest: tracks 29,30,31,32,33
    const result = gatherGutterTracks(
      100,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      MAX,
    );
    // First below-track is t=29, so closest 5 are [29,30,31,32,33]
    const firstBelow = result.belowTrackIdxs[0];
    expect(result.belowTrackIdxs).toHaveLength(MAX);
    for (let i = 0; i < MAX; i++) {
      expect(result.belowTrackIdxs[i]).toBe(firstBelow + i);
    }
  });

  it('selects the CLOSEST above-tracks (highest track indices before viewport top)', () => {
    const MAX = 5;
    // Scroll past 50 tracks (scrollY=1600): tracks 0..49 are above
    // With MAX=5, should return the 5 closest: [49,48,47,46,45] (closest-first)
    const scrollY = 50 * ROW_SIZE;
    const result = gatherGutterTracks(
      100,
      containerYForScroll(scrollY),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      MAX,
    );
    expect(result.aboveTrackIdxs).toHaveLength(MAX);
    // Closest-first order: highest t (closest to viewport) first
    expect(result.aboveTrackIdxs).toEqual([49, 48, 47, 46, 45]);
  });

  it('returns no above pins and some below pins at the very top (scrollY=0)', () => {
    const result = gatherGutterTracks(
      200,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    expect(result.aboveTrackIdxs).toHaveLength(0);
    expect(result.belowTrackIdxs.length).toBeGreaterThan(0);
  });

  it('returns only above pins when scrolled all the way to the bottom', () => {
    const trackCount = 50;
    // scrollY that puts track 49 just inside the bottom:
    // containerY + 49*rowSize = bottom approx → scrollY = RULER_H + 49*32 - SCREEN_H + 1
    const maxScrollY = Math.max(0, RULER_H + trackCount * ROW_SIZE - SCREEN_H);
    const result = gatherGutterTracks(
      trackCount,
      containerYForScroll(maxScrollY),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    expect(result.belowTrackIdxs).toHaveLength(0);
    expect(result.aboveTrackIdxs.length).toBeGreaterThan(0);
  });

  it('does not include visible tracks in either gutter', () => {
    const trackCount = 100;
    const scrollY = 10 * ROW_SIZE;
    const result = gatherGutterTracks(
      trackCount,
      containerYForScroll(scrollY),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
    );
    const containerY = containerYForScroll(scrollY);
    const allPins = [...result.aboveTrackIdxs, ...result.belowTrackIdxs];
    for (const t of allPins) {
      const screenY = containerY + t * ROW_SIZE;
      const isAbove = screenY + TRACK_H < RULER_H;
      const isBelow = screenY > SCREEN_H;
      expect(isAbove || isBelow).toBe(true);
    }
  });

  it('skips empty tracks (loading gap) and returns closest populated tracks', () => {
    // Bidirectional layout: desc=0-49, gap=50-149, asc=150-199.
    // Viewport is at start of asc section (scrollY = 150 * ROW_SIZE).
    // All 150 above tracks: only 0-49 have events (gap 50-149 is empty).
    // With maxPins=5 → should return tracks [45,46,47,48,49] (closest 5 populated above).
    const scrollY = 150 * ROW_SIZE;
    const hasEvents = (t: number) => t < 50 || t >= 150;
    const result = gatherGutterTracks(
      200,
      containerYForScroll(scrollY),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      5,
      hasEvents,
    );
    expect(result.aboveTrackIdxs.every((t) => t < 50)).toBe(true);
    expect(result.aboveTrackIdxs).toHaveLength(5);
    // Closest-first: highest t values (closest to viewport) come first
    expect(result.aboveTrackIdxs).toEqual([49, 48, 47, 46, 45]);
  });

  it('returns empty above array when all above tracks are in the loading gap', () => {
    // Tracks 0-99 empty (loading gap), tracks 100+ populated.
    // Scrolled to track 100 → above = 0-99, all empty → no pins.
    const scrollY = 100 * ROW_SIZE;
    const hasEvents = (t: number) => t >= 100;
    const result = gatherGutterTracks(
      200,
      containerYForScroll(scrollY),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      60,
      hasEvents,
    );
    expect(result.aboveTrackIdxs).toHaveLength(0);
  });

  it('skips empty below tracks and selects closest populated below tracks', () => {
    // tracks 0-28 visible, 29+ below. Gap = 30-59, asc = 60-99.
    // Closest populated below at scrollY=0: track 29 (populated), then 60-63.
    const hasEvents = (t: number) => t < 30 || t >= 60;
    const result = gatherGutterTracks(
      100,
      containerYForScroll(0),
      ROW_SIZE,
      TRACK_H,
      RULER_H,
      SCREEN_H,
      5,
      hasEvents,
    );
    expect(result.belowTrackIdxs.every((t) => hasEvents(t))).toBe(true);
    expect(result.belowTrackIdxs).toHaveLength(5);
  });
});
