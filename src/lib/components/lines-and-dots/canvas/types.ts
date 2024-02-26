import type { createEventDispatcher } from 'svelte';

export interface Render {
  (props: {
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    time: number;
  }): void;
}

export type Events =
  | 'click'
  | 'contextmenu'
  | 'dblclick'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseup'
  | 'wheel'
  | 'touchcancel'
  | 'touchend'
  | 'touchmove'
  | 'touchstart'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel';

export type LayerEventDetail = {
  x: number;
  y: number;
  originalEvent: MouseEvent | TouchEvent;
};

export type LayerEvents = {
  [E in Events]: LayerEventDetail;
};

export type CanvasLayerEvent = CustomEvent<LayerEventDetail>;

export type LayerEventDispatcher = ReturnType<
  typeof createEventDispatcher<LayerEvents>
>;

export type ResizeEvent = {
  resize: { width: number; height: number };
};
