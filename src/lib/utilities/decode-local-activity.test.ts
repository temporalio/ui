import { describe, expect, it } from 'vitest';

import {
  getLocalActivityMarkerEvent,
  hasLocalActivityMarker,
} from './decode-local-activity';

describe('decode-local-activity', () => {
  describe('hasLocalActivityMarker', () => {
    it('should be defined', () => {
      expect(hasLocalActivityMarker).toBeDefined();
    });
  });

  describe('getLocalActivityMarkerEvent', () => {
    it('should be defined', () => {
      expect(getLocalActivityMarkerEvent).toBeDefined();
    });
  });
});
