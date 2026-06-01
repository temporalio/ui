import { describe, expect, it } from 'vitest';

import { utcToZonedWallClock, zonedWallClockToUTCISOString } from './timezone';

describe('zonedWallClockToUTCISOString', () => {
  it('interprets a picked calendar day as midnight in the given timezone', () => {
    const pickedDay = new Date(2026, 5, 1); // June 1, 2026 (wall clock)

    expect(zonedWallClockToUTCISOString(pickedDay, 'UTC')).toBe(
      '2026-06-01T00:00:00.000Z',
    );
    expect(zonedWallClockToUTCISOString(pickedDay, 'America/Los_Angeles')).toBe(
      '2026-06-01T07:00:00.000Z',
    );
  });

  it('re-anchors the same calendar day when the timezone changes', () => {
    // Pick June 1 while a Pacific timezone is selected...
    const pickedDay = new Date(2026, 5, 1);
    expect(zonedWallClockToUTCISOString(pickedDay, 'America/Los_Angeles')).toBe(
      '2026-06-01T07:00:00.000Z',
    );

    // ...then switch to UTC. The picked day is unchanged, so the stored
    // instant re-anchors to midnight UTC.
    expect(zonedWallClockToUTCISOString(pickedDay, 'UTC')).toBe(
      '2026-06-01T00:00:00.000Z',
    );
  });

  it('returns an empty string when there is no date', () => {
    expect(zonedWallClockToUTCISOString(null, 'UTC')).toBe('');
  });
});

describe('utcToZonedWallClock', () => {
  it('round-trips a stored instant back to the same instant in its zone', () => {
    const iso = '2026-06-01T07:00:00.000Z';
    const wallClock = utcToZonedWallClock(iso, 'America/Los_Angeles');

    expect(wallClock).not.toBeNull();
    expect(zonedWallClockToUTCISOString(wallClock, 'America/Los_Angeles')).toBe(
      iso,
    );
  });

  it('reads the wall-clock calendar day in the given timezone', () => {
    // 2026-06-01T02:00Z is still May 31 in Pacific time.
    const wallClock = utcToZonedWallClock(
      '2026-06-01T02:00:00.000Z',
      'America/Los_Angeles',
    );

    expect(wallClock?.getMonth()).toBe(4); // May
    expect(wallClock?.getDate()).toBe(31);
  });

  it('returns null when there is no stored date', () => {
    expect(utcToZonedWallClock('', 'UTC')).toBeNull();
  });
});
