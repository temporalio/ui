import { describe, expect, test } from 'vitest';

import {
  CompactConfig,
  HistoryConfig,
  TimelineConfig,
  timelineTextPosition,
} from './constants';

describe('timelineTextPosition', () => {
  test('should calculate the correct text position for Compact', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([17, 85], 100, 1000, false, CompactConfig);
    expect(textPosition).toEqual([121, 100]);
    expect(textIndex).toEqual(1);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(false);
  });
  test('should calculate the correct text position for Timline', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([17, 85], 100, 1000, false, TimelineConfig);
    expect(textPosition).toEqual([103, 100]);
    expect(textIndex).toEqual(1);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(false);
  });
  test('should calculate the correct text position for Compact', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([17, 85], 100, 1000, false, HistoryConfig);
    expect(textPosition).toEqual([97, 100]);
    expect(textIndex).toEqual(1);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(false);
  });
  test('should calculate the correct middle text position with backdrop for Compact with wide range of points', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([37, 99, 490], 200, 500, false, CompactConfig);
    expect(textPosition).toEqual([135, 200]);
    expect(textIndex).toEqual(1);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(true);
  });
  test('should calculate the correct start text position for Compact with wide range of points', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([37, 99, 113], 500, 1200, false, CompactConfig);
    expect(textPosition).toEqual([149, 500]);
    expect(textIndex).toEqual(2);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(false);
  });
  test('should calculate the correct end text position for Compact with wide range of points', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([983, 1000, 1119], 500, 1200, false, CompactConfig);
    expect(textPosition).toEqual([947, 500]);
    expect(textIndex).toEqual(0);
    expect(textAnchor).toEqual('end');
    expect(backdrop).toEqual(false);
  });
  test('should calculate the correct midde text position for Pending with single point', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([281], 500, 1200, true, CompactConfig);
    expect(textPosition).toEqual([317, 500]);
    expect(textIndex).toEqual(0);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(true);
  });
  test('should calculate the correct midde text position for Pending with double points', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([281, 1000], 500, 1200, true, CompactConfig);
    expect(textPosition).toEqual([317, 500]);
    expect(textIndex).toEqual(0);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(true);
  });
  test('should calculate the correct midde text position for Pending with double points close to each other', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([281, 312], 500, 1200, true, CompactConfig);
    expect(textPosition).toEqual([348, 500]);
    expect(textIndex).toEqual(1);
    expect(textAnchor).toEqual('start');
    expect(backdrop).toEqual(true);
  });
  test('should calculate the correct end text position for Pending with double points close to each other at the end', () => {
    const { textPosition, textIndex, textAnchor, backdrop } =
      timelineTextPosition([1123, 1187], 500, 1200, true, CompactConfig);
    expect(textPosition).toEqual([1087, 500]);
    expect(textIndex).toEqual(0);
    expect(textAnchor).toEqual('end');
    expect(backdrop).toEqual(false);
  });
});
