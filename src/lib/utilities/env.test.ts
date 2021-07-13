import { isLocal, isCloud, getEnvironment } from './env';

const initialValue = process.env.TEMPORAL_UI_BUILD_TARGET;

describe('Build Environment', () => {
  afterEach(() => {
    process.env.TEMPORAL_UI_BUILD_TARGET = initialValue;
  });

  describe('getEnvironment', () => {
    it('should return "local" is TEMPORAL_UI_BUILD_TARGET is set to "local"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'local';
      expect(getEnvironment()).toBe('local');
    });

    it('should return "cloud" is TEMPORAL_UI_BUILD_TARGET is set to "cloud"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'cloud';
      expect(getEnvironment()).toBe('cloud');
    });

    it('should return "local" is TEMPORAL_UI_BUILD_TARGET is undefined', () => {
      delete process.env.TEMPORAL_UI_BUILD_TARGET;
      expect(getEnvironment()).toBe('local');
    });
  });

  describe('isLocal', () => {
    it('should return true if TEMPORAL_UI_BUILD_TARGET is set to "local"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'local';
      expect(isLocal()).toBe(true);
    });

    it('should return false if TEMPORAL_UI_BUILD_TARGET is set to "local"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'cloud';
      expect(isLocal()).toBe(false);
    });

    it('should throw an error if TEMPORAL_UI_BUILD_TARGET is set to something other than "cloud" or "local"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'not_valid';
      expect(() => isLocal()).toThrow();
    });
  });

  describe('isCloud', () => {
    it('should return true if TEMPORAL_UI_BUILD_TARGET is set to "cloud"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'cloud';
      expect(isCloud()).toBe(true);
    });

    it('should return false if TEMPORAL_UI_BUILD_TARGET is set to "cloud"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'local';
      expect(isCloud()).toBe(false);
    });

    it('should throw an error if TEMPORAL_UI_BUILD_TARGET is set to something other than "cloud" or "local"', () => {
      process.env.TEMPORAL_UI_BUILD_TARGET = 'not_valid';
      expect(() => isCloud()).toThrow();
    });
  });
});
