import { describe, expect, test } from 'vitest';

import {
  elbowConnector,
  pulseTiming,
  straightConnector,
} from './preview-connectors';

describe('straightConnector', () => {
  test('runs the full height', () => {
    expect(straightConnector(180, 36)).toEqual({
      d: 'M180 0 V36',
      length: 36,
    });
  });
});

describe('elbowConnector', () => {
  test('is straight when there is nothing to cross', () => {
    expect(elbowConnector(180, 180, 36, 8)).toEqual(straightConnector(180, 36));
  });

  test('measures verticals, both quarter arcs and the horizontal run', () => {
    const { length } = elbowConnector(180, 90, 36, 8);
    expect(length).toBeCloseTo(36 - 32 + Math.PI * 8 + 90);
  });

  test('is symmetric left and right', () => {
    expect(elbowConnector(180, 90, 36, 8).length).toBeCloseTo(
      elbowConnector(180, 270, 36, 8).length,
    );
  });
});

describe('pulseTiming', () => {
  test('gives segments on the same route the same speed', () => {
    const timing = pulseTiming(200, 20, 100, 0);
    expect(timing.duration).toBeCloseTo(2.2);
    expect(timing.keyTimes(0, 36)).toBe(`0;0;${56 / 100 / 2.2};1`);
  });

  test('rests until the cycle ends on a short route', () => {
    const timing = pulseTiming(100, 0, 100, 3);
    expect(timing.duration).toBe(3);
    expect(timing.keyTimes(0, 100)).toBe(`0;0;${1 / 3};1`);
  });

  test('clamps keyTimes to the cycle', () => {
    expect(pulseTiming(100, 20, 100, 0).keyTimes(90, 30)).toMatch(/;1;1$/);
  });
});
