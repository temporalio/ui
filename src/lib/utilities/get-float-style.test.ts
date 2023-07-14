import { describe, expect, it } from 'vitest';

import { getFloatStyle } from './get-float-style';

describe('getFloatStyle', () => {
  it('should return a style string for a width/height and screenWidth over default breakpoint', () => {
    const dimensions = {
      width: 390,
      height: 82,
      screenWidth: 1400,
    };
    const style = 'position: absolute; right: 410px; top: -96px';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
  it('should return a style string for a width/height and screenWidth over custom breakpoint', () => {
    const dimensions = {
      width: 390,
      height: 82,
      screenWidth: 1400,
      breakpoint: 900,
    };
    const style = 'position: absolute; right: 410px; top: -96px';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
  it('should return an empty string for a width/height and screenWidth under default breakpoint', () => {
    const dimensions = {
      width: 390,
      height: 82,
      screenWidth: 600,
    };
    const style = '';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
  it('should return an empty string for a width/height and screenWidth under default breakpoint', () => {
    const dimensions = {
      width: 390,
      height: 82,
      screenWidth: 750,
      breakpoint: 800,
    };
    const style = '';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
  it('should return an empty string if missing width', () => {
    const dimensions = {
      height: 82,
      screenWidth: 750,
      breakpoint: 800,
    };
    const style = '';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
  it('should return an empty string if missing height', () => {
    const dimensions = {
      width: 390,
      screenWidth: 750,
      breakpoint: 800,
    };
    const style = '';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
  it('should return an empty string if missing screenWidth', () => {
    const dimensions = {
      height: 82,
      width: 390,
      breakpoint: 800,
    };
    const style = '';
    expect(getFloatStyle(dimensions)).toEqual(style);
  });
});
