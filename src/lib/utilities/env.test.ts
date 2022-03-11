// Need to mock out the getEnvironment out to the jest mock function
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('./get-environment');

import { isLocal, isCloud } from './env';
import { getEnvironment } from './get-environment';

const setEnvLocal = () => 'local';
const setEnvCloud = () => 'cloud';

describe('Build Environment', () => {
  describe('isLocal', () => {
    it('should return true if VITE_TEMPORAL_UI_BUILD_TARGET is set to "local"', () => {
      (getEnvironment as any).mockImplementation(setEnvLocal);
      expect(isLocal()).toBe(true);
    });

    it('should return false if VITE_TEMPORAL_UI_BUILD_TARGET is set to "local"', () => {
      (getEnvironment as any).mockImplementation(setEnvCloud);
      expect(isLocal()).toBe(false);
    });

    it('should throw an error if VITE_TEMPORAL_UI_BUILD_TARGET is set to something other than "cloud" or "local"', () => {
      (getEnvironment as any).mockImplementation(() => 'not_valid');
      expect(() => isLocal()).toThrow();
    });
  });

  describe('isCloud', () => {
    it('should return true if VITE_TEMPORAL_UI_BUILD_TARGET is set to "cloud"', () => {
      (getEnvironment as any).mockImplementation(setEnvCloud);
      expect(isCloud()).toBe(true);
    });

    it('should return false if VITE_TEMPORAL_UI_BUILD_TARGET is set to "local"', () => {
      (getEnvironment as any).mockImplementation(setEnvLocal);
      expect(isCloud()).toBe(false);
    });

    it('should throw an error if VITE_TEMPORAL_UI_BUILD_TARGET is set to something other than "cloud" or "local"', () => {
      (getEnvironment as any).mockImplementation(() => 'not_valid');
      expect(() => isCloud()).toThrow();
    });
  });
});
