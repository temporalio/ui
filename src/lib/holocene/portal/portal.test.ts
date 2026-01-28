import { describe, expect, it } from 'vitest';

import {
  applyOffset,
  calculateBasePosition,
  calculatePosition,
  constrainToViewport,
  detectCollision,
  getFlippedOffset,
  getFlippedPosition,
} from './position-calculator';
import type { PortalPosition, Rect } from './types';

describe('position-calculator', () => {
  const createRect = (
    left: number,
    top: number,
    width: number,
    height: number,
  ): Rect => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  });

  const anchorRect = createRect(100, 100, 50, 30);
  const portalRect = createRect(0, 0, 200, 100);
  const viewportRect = createRect(0, 0, 1024, 768);

  describe('calculateBasePosition', () => {
    it('should calculate bottom position', () => {
      const result = calculateBasePosition(anchorRect, portalRect, 'bottom');
      expect(result.x).toBe(25);
      expect(result.y).toBe(130);
    });

    it('should calculate top position', () => {
      const result = calculateBasePosition(anchorRect, portalRect, 'top');
      expect(result.x).toBe(25);
      expect(result.y).toBe(0);
    });

    it('should calculate left position', () => {
      const result = calculateBasePosition(anchorRect, portalRect, 'left');
      expect(result.x).toBe(-100);
      expect(result.y).toBe(65);
    });

    it('should calculate right position', () => {
      const result = calculateBasePosition(anchorRect, portalRect, 'right');
      expect(result.x).toBe(150);
      expect(result.y).toBe(65);
    });

    it('should calculate bottom-left position', () => {
      const result = calculateBasePosition(
        anchorRect,
        portalRect,
        'bottom-left',
      );
      expect(result.x).toBe(100);
      expect(result.y).toBe(130);
    });

    it('should calculate bottom-right position', () => {
      const result = calculateBasePosition(
        anchorRect,
        portalRect,
        'bottom-right',
      );
      expect(result.x).toBe(-50);
      expect(result.y).toBe(130);
    });

    it('should calculate top-left position', () => {
      const result = calculateBasePosition(anchorRect, portalRect, 'top-left');
      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
    });

    it('should calculate top-right position', () => {
      const result = calculateBasePosition(anchorRect, portalRect, 'top-right');
      expect(result.x).toBe(-50);
      expect(result.y).toBe(0);
    });
  });

  describe('applyOffset', () => {
    it('should apply positive offset', () => {
      const result = applyOffset({ x: 100, y: 200 }, { x: 10, y: 20 });
      expect(result.x).toBe(110);
      expect(result.y).toBe(220);
    });

    it('should apply negative offset', () => {
      const result = applyOffset({ x: 100, y: 200 }, { x: -10, y: -20 });
      expect(result.x).toBe(90);
      expect(result.y).toBe(180);
    });

    it('should handle missing x offset', () => {
      const result = applyOffset({ x: 100, y: 200 }, { y: 20 });
      expect(result.x).toBe(100);
      expect(result.y).toBe(220);
    });

    it('should handle missing y offset', () => {
      const result = applyOffset({ x: 100, y: 200 }, { x: 10 });
      expect(result.x).toBe(110);
      expect(result.y).toBe(200);
    });

    it('should handle empty offset object', () => {
      const result = applyOffset({ x: 100, y: 200 }, {});
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });
  });

  describe('detectCollision', () => {
    it('should detect no collision when portal is within viewport', () => {
      const result = detectCollision(100, 100, portalRect, viewportRect);
      expect(result.top).toBe(false);
      expect(result.bottom).toBe(false);
      expect(result.left).toBe(false);
      expect(result.right).toBe(false);
    });

    it('should detect top collision', () => {
      const result = detectCollision(100, -10, portalRect, viewportRect);
      expect(result.top).toBe(true);
      expect(result.bottom).toBe(false);
    });

    it('should detect bottom collision', () => {
      const result = detectCollision(100, 700, portalRect, viewportRect);
      expect(result.top).toBe(false);
      expect(result.bottom).toBe(true);
    });

    it('should detect left collision', () => {
      const result = detectCollision(-10, 100, portalRect, viewportRect);
      expect(result.left).toBe(true);
      expect(result.right).toBe(false);
    });

    it('should detect right collision', () => {
      const result = detectCollision(900, 100, portalRect, viewportRect);
      expect(result.left).toBe(false);
      expect(result.right).toBe(true);
    });

    it('should detect multiple collisions', () => {
      const result = detectCollision(-10, -10, portalRect, viewportRect);
      expect(result.top).toBe(true);
      expect(result.left).toBe(true);
    });
  });

  describe('getFlippedPosition', () => {
    it('should flip top to bottom', () => {
      expect(getFlippedPosition('top')).toBe('bottom');
    });

    it('should flip bottom to top', () => {
      expect(getFlippedPosition('bottom')).toBe('top');
    });

    it('should flip left to right', () => {
      expect(getFlippedPosition('left')).toBe('right');
    });

    it('should flip right to left', () => {
      expect(getFlippedPosition('right')).toBe('left');
    });

    it('should flip top-left to bottom-left', () => {
      expect(getFlippedPosition('top-left')).toBe('bottom-left');
    });

    it('should flip top-right to bottom-right', () => {
      expect(getFlippedPosition('top-right')).toBe('bottom-right');
    });

    it('should flip bottom-left to top-left', () => {
      expect(getFlippedPosition('bottom-left')).toBe('top-left');
    });

    it('should flip bottom-right to top-right', () => {
      expect(getFlippedPosition('bottom-right')).toBe('top-right');
    });
  });

  describe('getFlippedOffset', () => {
    it('should invert y offset when flipping from bottom to top', () => {
      const result = getFlippedOffset({ y: 4 }, 'bottom', 'top');
      expect(result.y).toBe(-4);
      expect(result.x).toBe(0);
    });

    it('should invert y offset when flipping from top to bottom', () => {
      const result = getFlippedOffset({ y: 8 }, 'top', 'bottom');
      expect(result.y).toBe(-8);
      expect(result.x).toBe(0);
    });

    it('should invert x offset when flipping from left to right', () => {
      const result = getFlippedOffset({ x: 4 }, 'left', 'right');
      expect(result.x).toBe(-4);
      expect(result.y).toBe(0);
    });

    it('should invert x offset when flipping from right to left', () => {
      const result = getFlippedOffset({ x: 8 }, 'right', 'left');
      expect(result.x).toBe(-8);
      expect(result.y).toBe(0);
    });

    it('should invert y offset when flipping from bottom-left to top-left', () => {
      const result = getFlippedOffset(
        { x: 2, y: 4 },
        'bottom-left',
        'top-left',
      );
      expect(result.x).toBe(2);
      expect(result.y).toBe(-4);
    });

    it('should invert y offset when flipping from bottom-right to top-right', () => {
      const result = getFlippedOffset(
        { x: 2, y: 4 },
        'bottom-right',
        'top-right',
      );
      expect(result.x).toBe(2);
      expect(result.y).toBe(-4);
    });

    it('should invert y offset when flipping from top-left to bottom-left', () => {
      const result = getFlippedOffset(
        { x: 2, y: 4 },
        'top-left',
        'bottom-left',
      );
      expect(result.x).toBe(2);
      expect(result.y).toBe(-4);
    });

    it('should invert y offset when flipping from top-right to bottom-right', () => {
      const result = getFlippedOffset(
        { x: 2, y: 4 },
        'top-right',
        'bottom-right',
      );
      expect(result.x).toBe(2);
      expect(result.y).toBe(-4);
    });

    it('should handle zero offsets', () => {
      const result = getFlippedOffset({ x: 0, y: 0 }, 'bottom', 'top');
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should handle undefined offsets', () => {
      const result = getFlippedOffset({}, 'bottom', 'top');
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should preserve x offset when flipping from bottom to top', () => {
      const result = getFlippedOffset({ x: 4, y: 8 }, 'bottom', 'top');
      expect(result.x).toBe(4);
      expect(result.y).toBe(-8);
    });
  });

  describe('constrainToViewport', () => {
    it('should not constrain when portal fits within viewport', () => {
      const result = constrainToViewport(100, 100, portalRect, viewportRect);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should constrain left edge', () => {
      const result = constrainToViewport(-50, 100, portalRect, viewportRect);
      expect(result.x).toBe(0);
      expect(result.y).toBe(100);
    });

    it('should constrain right edge', () => {
      const result = constrainToViewport(900, 100, portalRect, viewportRect);
      expect(result.x).toBe(824);
      expect(result.y).toBe(100);
    });

    it('should constrain top edge', () => {
      const result = constrainToViewport(100, -50, portalRect, viewportRect);
      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
    });

    it('should constrain bottom edge', () => {
      const result = constrainToViewport(100, 700, portalRect, viewportRect);
      expect(result.x).toBe(100);
      expect(result.y).toBe(668);
    });

    it('should constrain both horizontal and vertical edges', () => {
      const result = constrainToViewport(-50, -50, portalRect, viewportRect);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('calculatePosition', () => {
    it('should calculate position without flipping when no collision', () => {
      const result = calculatePosition(
        anchorRect,
        portalRect,
        'bottom',
        {},
        true,
      );
      expect(result.x).toBe(25);
      expect(result.y).toBe(130);
      expect(result.flipped).toBe(false);
      expect(result.finalPosition).toBe('bottom');
    });

    it('should apply offset to position', () => {
      const result = calculatePosition(
        anchorRect,
        portalRect,
        'bottom',
        { x: 10, y: 20 },
        true,
      );
      expect(result.x).toBe(35);
      expect(result.y).toBe(150);
    });

    it('should not flip when flipOnCollision is false', () => {
      const topAnchor = createRect(100, 50, 50, 30);
      const result = calculatePosition(topAnchor, portalRect, 'top', {}, false);
      expect(result.flipped).toBe(false);
      expect(result.finalPosition).toBe('top');
    });

    it('should constrain to viewport when position exceeds bounds', () => {
      const rightAnchor = createRect(900, 100, 50, 30);
      const result = calculatePosition(
        rightAnchor,
        portalRect,
        'right',
        {},
        false,
      );
      expect(result.x).toBe(824);
    });
  });

  describe('collision and flipping integration', () => {
    it('should flip from top to bottom when collision detected', () => {
      const topAnchor = createRect(100, 50, 50, 30);
      const largePortal = createRect(0, 0, 200, 100);

      const originalGetViewportRect = globalThis.window;

      Object.defineProperty(globalThis, 'window', {
        value: {
          innerWidth: 1024,
          innerHeight: 768,
        },
        writable: true,
      });

      const result = calculatePosition(
        topAnchor,
        largePortal,
        'top' as PortalPosition,
        {},
        true,
      );

      Object.defineProperty(globalThis, 'window', {
        value: originalGetViewportRect,
        writable: true,
      });

      expect(result.flipped).toBe(true);
      expect(result.finalPosition).toBe('bottom');
    });
  });
});
