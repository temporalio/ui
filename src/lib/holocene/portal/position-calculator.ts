import type {
  PortalOffset,
  PortalPosition,
  PositionResult,
  Rect,
} from './types';

export function getViewportRect(): Rect {
  return {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    bottom: window.innerHeight,
    right: window.innerWidth,
  };
}

export function getElementRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
  };
}

export function calculateBasePosition(
  anchorRect: Rect,
  portalRect: Rect,
  position: PortalPosition,
): { x: number; y: number } {
  const positions: Record<PortalPosition, { x: number; y: number }> = {
    top: {
      x: anchorRect.left + anchorRect.width / 2 - portalRect.width / 2,
      y: anchorRect.top - portalRect.height,
    },
    bottom: {
      x: anchorRect.left + anchorRect.width / 2 - portalRect.width / 2,
      y: anchorRect.bottom,
    },
    left: {
      x: anchorRect.left - portalRect.width,
      y: anchorRect.top + anchorRect.height / 2 - portalRect.height / 2,
    },
    right: {
      x: anchorRect.right,
      y: anchorRect.top + anchorRect.height / 2 - portalRect.height / 2,
    },
    'top-left': {
      x: anchorRect.left,
      y: anchorRect.top - portalRect.height,
    },
    'top-right': {
      x: anchorRect.right - portalRect.width,
      y: anchorRect.top - portalRect.height,
    },
    'bottom-left': {
      x: anchorRect.left,
      y: anchorRect.bottom,
    },
    'bottom-right': {
      x: anchorRect.right - portalRect.width,
      y: anchorRect.bottom,
    },
  };

  return positions[position];
}

export function applyOffset(
  coords: { x: number; y: number },
  offset: PortalOffset,
): { x: number; y: number } {
  return {
    x: coords.x + (offset.x ?? 0),
    y: coords.y + (offset.y ?? 0),
  };
}

export function detectCollision(
  x: number,
  y: number,
  portalRect: Rect,
  viewportRect: Rect,
): {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
} {
  return {
    top: y < viewportRect.top,
    bottom: y + portalRect.height > viewportRect.bottom,
    left: x < viewportRect.left,
    right: x + portalRect.width > viewportRect.right,
  };
}

export function getFlippedPosition(position: PortalPosition): PortalPosition {
  const flips: Record<PortalPosition, PortalPosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
    'top-left': 'bottom-left',
    'top-right': 'bottom-right',
    'bottom-left': 'top-left',
    'bottom-right': 'top-right',
  };

  return flips[position];
}

export function getFlippedOffset(
  offset: PortalOffset,
  originalPosition: PortalPosition,
  flippedPosition: PortalPosition,
): PortalOffset {
  const flippedOffset = {
    x: offset.x ?? 0,
    y: offset.y ?? 0,
  };

  if (
    (originalPosition.includes('top') && flippedPosition.includes('bottom')) ||
    (originalPosition.includes('bottom') && flippedPosition.includes('top'))
  ) {
    flippedOffset.y = offset.y ? -offset.y : 0;
  }

  if (
    (originalPosition.includes('left') && flippedPosition.includes('right')) ||
    (originalPosition.includes('right') && flippedPosition.includes('left'))
  ) {
    flippedOffset.x = offset.x ? -offset.x : 0;
  }

  return flippedOffset;
}

export function constrainToViewport(
  x: number,
  y: number,
  portalRect: Rect,
  viewportRect: Rect,
): { x: number; y: number } {
  let constrainedX = x;
  let constrainedY = y;

  if (x < viewportRect.left) {
    constrainedX = viewportRect.left;
  } else if (x + portalRect.width > viewportRect.right) {
    constrainedX = viewportRect.right - portalRect.width;
  }

  if (y < viewportRect.top) {
    constrainedY = viewportRect.top;
  } else if (y + portalRect.height > viewportRect.bottom) {
    constrainedY = viewportRect.bottom - portalRect.height;
  }

  return { x: constrainedX, y: constrainedY };
}

export function calculatePosition(
  anchorRect: Rect,
  portalRect: Rect,
  position: PortalPosition,
  offset: PortalOffset,
  flipOnCollision: boolean,
  containerRect?: Rect,
): PositionResult {
  const viewportRect = containerRect || getViewportRect();

  const baseCoords = calculateBasePosition(anchorRect, portalRect, position);
  let coords = applyOffset(baseCoords, offset);

  let flipped = false;
  let finalPosition = position;

  if (flipOnCollision) {
    const collision = detectCollision(
      coords.x,
      coords.y,
      portalRect,
      viewportRect,
    );

    if (
      collision.top ||
      collision.bottom ||
      collision.left ||
      collision.right
    ) {
      const flippedPos = getFlippedPosition(position);
      const flippedOffset = getFlippedOffset(offset, position, flippedPos);
      const flippedBaseCoords = calculateBasePosition(
        anchorRect,
        portalRect,
        flippedPos,
      );
      const flippedCoords = applyOffset(flippedBaseCoords, flippedOffset);
      const flippedCollision = detectCollision(
        flippedCoords.x,
        flippedCoords.y,
        portalRect,
        viewportRect,
      );

      const originalCollisionCount = [
        collision.top,
        collision.bottom,
        collision.left,
        collision.right,
      ].filter(Boolean).length;
      const flippedCollisionCount = [
        flippedCollision.top,
        flippedCollision.bottom,
        flippedCollision.left,
        flippedCollision.right,
      ].filter(Boolean).length;

      if (flippedCollisionCount < originalCollisionCount) {
        coords = flippedCoords;
        flipped = true;
        finalPosition = flippedPos;
      }
    }
  }

  const constrained = constrainToViewport(
    coords.x,
    coords.y,
    portalRect,
    viewportRect,
  );

  return {
    x: constrained.x,
    y: constrained.y,
    flipped,
    finalPosition,
  };
}
