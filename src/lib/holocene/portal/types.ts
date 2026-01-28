import type { Snippet } from 'svelte';
import type { ClassNameValue } from 'tailwind-merge';

export type PortalPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface PortalOffset {
  x?: number;
  y?: number;
}

export interface PortalProps {
  anchor: HTMLElement | string;
  open?: boolean;
  position?: PortalPosition;
  offset?: PortalOffset;
  target?: HTMLElement | string;
  hideWhenAnchorHidden?: boolean;
  scrollContainer?: HTMLElement | Window | string;
  flipOnCollision?: boolean;
  class?: ClassNameValue;
  children: Snippet;
}

export interface PositionResult {
  x: number;
  y: number;
  flipped: boolean;
  finalPosition: PortalPosition;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}
