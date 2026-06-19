import 'pixi.js/unsafe-eval';
import type { Texture } from 'pixi.js';
import {
  Application,
  BitmapText,
  Container,
  Graphics,
  RendererType,
  RenderTexture,
  Sprite,
  TilingSprite,
} from 'pixi.js';

import {
  getGroupCount,
  getGroupMeta,
  getVisibleGroupCount,
} from '$lib/services/grouped-event-buffer';

import { EVENT_COLORS, STATUS_ALPHA } from '../eventColors';
import {
  buildIconTextures,
  PIXI_TYPE_TO_ICON,
  type PixiIconName,
} from './icon-textures';
import {
  timelineState as _timelineState,
  type TimelineCtx,
  type TimelineState,
} from '../timeline-ctx.svelte';
import type { EventStatus, PixiRenderArgs, TimelineConfig } from '../types';
import {
  ensureBitmapFonts,
  FONT_EVENT,
  FONT_RULER,
  formatTickLabel,
  pickTickInterval,
} from './fonts';
import { gutterIconLayout } from './gutter-layout';
import { clampViewportStartMs } from './viewport-clamp';

export const DEFAULT_CONFIG: TimelineConfig = {
  trackHeight: 28,
  trackGap: 4,
  minZoom: 0.00005,
  maxZoom: 20,
  backgroundColor: 0x0c0c14,
};

const RULER_H = 28;
const ICON_SIZE = 14; // icon render target size (px)
const ICON_PAD = 2; // padding on each side of icon
const MIN_BAR_W = ICON_SIZE + ICON_PAD * 2; // bar always wide enough for icon
// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

interface PanState {
  active: boolean;
  startX: number;
  startY: number;
  originStartMs: number;
  originScrollY: number;
}

/** Lightweight per-event record used by the gutter pin logic. */
interface PinEvent {
  poolIdx: number;
  startMs: number;
  endMs: number;
  trackIndex: number;
  pixiType: string;
  pixiStatus: string;
  displayName: string;
}

/** A rendered gutter pin bar (hit-testable). */
interface PinBar {
  poolIdx: number;
  px: number;
  py: number;
  pw: number;
  ph: number;
}

export class PixiRenderer {
  private app: Application;
  // Layer order (bottom to top): gridGfx → scrollContainer → rulerGfx → labelContainer
  // Grouping same types avoids batch breaks.
  private gridGfx: Graphics;
  private scrollContainer: Container; // shifted by -scrollY; holds baseGfx, loadingContainer, eventLabelContainer
  private baseGfx: Graphics;
  private loadingContainer: Container;
  private eventLabelContainer: Container;
  private rulerGfx: Graphics;
  private labelContainer: Container;
  private loadingTexture: Texture | null = null;
  private loadingBarPool: TilingSprite[] = [];
  private labelPool: BitmapText[] = [];
  private eventLabelPool: BitmapText[] = [];
  private eventLabelIndex = 0;
  private iconTextures: Record<PixiIconName, Texture> | null = null;
  private iconSpritePool: Sprite[] = [];
  private iconSpriteIndex = 0;
  private lastTileOffset = -1;

  // Real-data state
  private dataOriginMs = NaN;
  private currentArgs: PixiRenderArgs = {
    poolCount: 0,
    totalRows: 0,
    ascCount: 0,
    descCount: 0,
    finalized: false,
  };

  private config: TimelineConfig;
  private canvas: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;
  private rafId: number | null = null;

  private canvasRect: DOMRect = new DOMRect();

  private pendingPanClientX = 0;
  private pendingPanClientY = 0;
  private panFlushRafId: number | null = null;

  private pendingWheelDX = 0;
  private pendingZoomFactor = 1;
  private pendingZoomCX = 0;
  private pendingZoomCY = 0;
  private hasPendingWheel = false;

  private pendingHoverClientX = 0;
  private pendingHoverClientY = 0;
  private hasPendingHover = false;

  private lastCursor = 'default';

  private panState: PanState = {
    active: false,
    startX: 0,
    startY: 0,
    originStartMs: 0,
    originScrollY: 0,
  };

  /** Flat list of gutter pin events built when data loads, keyed by track. */
  private byTrack: PinEvent[][] = [];
  private topPins: PinBar[] = [];
  private bottomPins: PinBar[] = [];
  /** Left/right edge pins: events on visible tracks that are horizontally off-screen. */
  private leftPins: { poolIdx: number; py: number; ph: number }[] = [];
  private rightPins: { poolIdx: number; py: number; ph: number }[] = [];
  private pinnedPoolIdxs = new Set<number>();
  /** Gutter Graphics drawn above/below the main scroll container (screen-space). */
  private gutterTopGfx: Graphics;
  private gutterBottomGfx: Graphics;
  /** Icon sprites for top/bottom gutter pins — live in screen space, not scroll space. */
  private gutterIconContainer: Container;
  private gutterIconSpritePool: Sprite[] = [];
  private gutterIconSpriteIndex = 0;

  private viewportInitialized = false;

  private dirty = true;
  private lastStartMs = NaN;
  private lastScrollY = NaN;
  private lastZoom = NaN;
  private lastScreenW = 0;
  private lastScreenH = 0;

  private readonly state: TimelineState;
  private readonly ctx: TimelineCtx | undefined;

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else {
      this.dirty = true;
      this.startLoop();
    }
  };

  constructor(
    canvas: HTMLCanvasElement,
    config: TimelineConfig = DEFAULT_CONFIG,
    ctx?: TimelineCtx,
  ) {
    this.canvas = canvas;
    this.config = config;
    this.ctx = ctx;
    this.state = ctx?.state ?? _timelineState;
    this.app = new Application();
    this.gridGfx = new Graphics();
    this.scrollContainer = new Container();
    this.baseGfx = new Graphics();
    this.loadingContainer = new Container();
    this.eventLabelContainer = new Container();
    this.rulerGfx = new Graphics();
    this.labelContainer = new Container();
    this.gutterTopGfx = new Graphics();
    this.gutterBottomGfx = new Graphics();
    this.gutterIconContainer = new Container();
    this.resizeObserver = new ResizeObserver(() => {
      this.app.resize();
      this.canvasRect = this.canvas.getBoundingClientRect();
      this.dirty = true;
    });
  }

  async init(): Promise<this> {
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    await this.app.init({
      canvas: this.canvas,
      background: this.config.backgroundColor,
      resizeTo: this.canvas.parentElement ?? this.canvas,
      antialias: true,
      autoDensity: true,
      resolution: dpr,
      eventFeatures: {
        move: false,
        globalMove: false,
        click: false,
        wheel: false,
      },
    });

    // scrollContainer holds everything that moves with vertical scroll.
    // Grouped by type (Graphics→TilingSprite→BitmapText) to minimise batch breaks.
    this.scrollContainer.addChild(
      this.baseGfx,
      this.loadingContainer,
      this.eventLabelContainer,
    );
    // Layer order: grid → scrolled events → gutter bars → gutter icons → ruler → ruler labels
    this.app.stage.addChild(
      this.gridGfx,
      this.scrollContainer,
      this.gutterTopGfx,
      this.gutterBottomGfx,
      this.gutterIconContainer,
      this.rulerGfx,
      this.labelContainer,
    );

    this.iconTextures = buildIconTextures(this.app, ICON_SIZE);

    this.app.ticker.stop();
    this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
    this.app.resize();
    this.canvasRect = this.canvas.getBoundingClientRect();
    this.setupInteraction();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startLoop(true);

    this.state.rendererInfo =
      this.app.renderer.type === RendererType.WEBGPU ? 'WebGPU' : 'WebGL2';

    return this;
  }

  /** Called by TimelineCanvas when renderArgs change. Initialises viewport on first call. */
  loadEvents(args: PixiRenderArgs, _opts?: { preserveViewport?: boolean }) {
    this.currentArgs = args;
    this.dirty = true;

    if (args.poolCount === 0) return;

    // Scan loaded groups for time range (O(N), called ~20x per fetch — fast enough).
    let minMs = Infinity;
    let maxMs = -Infinity;
    const count = getGroupCount();
    for (let i = 0; i < count; i++) {
      const meta = getGroupMeta(i);
      if (!meta || meta.startMs === 0) continue;
      if (meta.startMs < minMs) minMs = meta.startMs;
      if (meta.endMs > maxMs) maxMs = meta.endMs;
    }
    if (minMs === Infinity) return;

    this.dataOriginMs = minMs;
    const endRelMs = maxMs - minMs;
    this.state.dataRange = { startMs: 0, endMs: endRelMs + 400 };
    this.state.totalTracks = args.totalRows;
    this.state.totalEvents = count;

    if (!this.viewportInitialized) {
      const span = endRelMs + 600;
      const screenW = this.app.screen.width || 1200;
      const zoom = Math.max(
        this.config.minZoom,
        Math.min(this.config.maxZoom, screenW / Math.max(span, 1)),
      );
      this.state.viewport.startMs = -200;
      this.state.viewport.zoom = zoom;
      this.state.viewport.scrollY = 0;
      this.viewportInitialized = true;
    }

    if (args.finalized) {
      this.rebuildByTrack();
    }
  }

  /** Build a track-indexed lookup for gutter pin queries. */
  private rebuildByTrack() {
    this.byTrack = [];
    const count = getGroupCount();
    const origin = this.dataOriginMs;
    if (isNaN(origin)) return;
    for (let i = 0; i < count; i++) {
      const meta = getGroupMeta(i);
      if (
        !meta ||
        meta.pixiType === 'GROUP_WORKFLOW_TASK' ||
        meta.trackIndex < 0
      )
        continue;
      const t = meta.trackIndex;
      (this.byTrack[t] ??= []).push({
        poolIdx: i,
        startMs: meta.startMs - origin,
        endMs: Math.max(meta.endMs - origin, meta.startMs - origin + 1),
        trackIndex: t,
        pixiType: meta.pixiType,
        pixiStatus: meta.pixiStatus,
        displayName:
          meta.group?.displayName ??
          meta.pixiType.replace(/^(EVENT_TYPE_|GROUP_)/, '').replace(/_/g, ' '),
      });
    }
  }

  /** Legacy path kept for child workflow canvases — no-op in demo mode. */
  loadEventsLegacy(_events: unknown[]) {
    this.dirty = true;
  }

  private maxScrollY(): number {
    const { trackHeight, trackGap } = this.config;
    const rowSize =
      trackHeight * this.state.viewport.scaleY +
      Math.max(1, trackGap * this.state.viewport.scaleY);
    const totalTracks = Math.max(
      this.currentArgs.totalRows,
      getVisibleGroupCount(),
    );
    return Math.max(
      0,
      totalTracks * rowSize - (this.app.screen.height - RULER_H),
    );
  }

  private startLoop(skipFirstFrame = false) {
    if (this.rafId !== null) return;
    const tick = () => {
      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    if (skipFirstFrame) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        tick();
      });
    } else {
      this.rafId = requestAnimationFrame(tick);
    }
  }

  private getLabel(index: number): BitmapText {
    if (index >= this.labelPool.length) {
      const t = new BitmapText({
        text: '',
        style: { fontFamily: FONT_RULER, fontSize: 10 },
      });
      t.anchor.set(0, 0.5);
      this.labelPool.push(t);
      this.labelContainer.addChild(t);
    }
    return this.labelPool[index];
  }

  private getEventLabel(): BitmapText {
    const idx = this.eventLabelIndex++;
    if (idx >= this.eventLabelPool.length) {
      const t = new BitmapText({
        text: '',
        style: { fontFamily: FONT_EVENT, fontSize: 10 },
      });
      t.anchor.set(0, 0.5);
      this.eventLabelPool.push(t);
      this.eventLabelContainer.addChild(t);
    }
    return this.eventLabelPool[idx];
  }

  private getIconSprite(): Sprite {
    const idx = this.iconSpriteIndex++;
    if (idx >= this.iconSpritePool.length) {
      const s = new Sprite();
      s.anchor.set(0, 0.5);
      this.iconSpritePool.push(s);
      this.eventLabelContainer.addChild(s);
    }
    return this.iconSpritePool[idx];
  }

  private getGutterIconSprite(): Sprite {
    const idx = this.gutterIconSpriteIndex++;
    if (idx >= this.gutterIconSpritePool.length) {
      const s = new Sprite();
      s.anchor.set(0, 0.5);
      this.gutterIconSpritePool.push(s);
      this.gutterIconContainer.addChild(s);
    }
    return this.gutterIconSpritePool[idx];
  }

  /** Single-letter icon from pixiType — matches the prototype's text strategy. */
  private static iconLetter(pixiType: string): string {
    if (pixiType === 'GROUP_ACTIVITY') return 'A';
    if (pixiType === 'GROUP_CHILD_WORKFLOW') return 'C';
    if (pixiType === 'GROUP_TIMER') return 'T';
    if (pixiType === 'GROUP_WORKFLOW_TASK') return 'W';
    if (pixiType === 'GROUP_SIGNAL') return 'S';
    if (pixiType === 'GROUP_MARKER') return 'M';
    return (
      pixiType.replace(/^(EVENT_TYPE_|GROUP_)/, '')[0] ?? '?'
    ).toUpperCase();
  }

  /**
   * Build a label with icon letter + name that fits within `maxPx` pixels.
   * ~6 px per char, 8 px total padding.
   */
  private static fitLabel(
    icon: string,
    displayName: string,
    maxPx: number,
  ): string {
    const maxChars = Math.max(1, Math.floor((maxPx - 8) / 6));
    if (maxChars <= 1) return icon;
    const full = `${icon} ${displayName}`;
    if (full.length <= maxChars) return full;
    const nameChars = Math.max(0, maxChars - icon.length - 3);
    return `${icon} ${displayName.slice(0, nameChars)}…`;
  }

  /** Fit display name only (used when an SVG icon is already rendered). */
  private static fitName(displayName: string, maxPx: number): string {
    const maxChars = Math.max(0, Math.floor((maxPx - 6) / 6));
    if (maxChars === 0) return '';
    if (displayName.length <= maxChars) return displayName;
    if (maxChars <= 1) return displayName[0] ?? '';
    return displayName.slice(0, maxChars - 1) + '…';
  }

  /** Bake the diagonal-stripe tile once into a RenderTexture. */
  private ensureLoadingTexture(): Texture {
    if (this.loadingTexture) return this.loadingTexture;
    const SIZE = 32;
    const rt = RenderTexture.create({ width: SIZE, height: SIZE });
    const g = new Graphics();
    g.rect(0, 0, SIZE, SIZE).fill({ color: 0x1e293b });
    // Two diagonal lines per tile (45°)
    g.moveTo(0, SIZE).lineTo(SIZE, 0).stroke({ color: 0x2d3f55, width: 3 });
    g.moveTo(-SIZE, SIZE).lineTo(0, 0).stroke({ color: 0x2d3f55, width: 3 });
    g.moveTo(SIZE, SIZE)
      .lineTo(SIZE * 2, 0)
      .stroke({ color: 0x2d3f55, width: 3 });
    this.app.renderer.render({ container: g, target: rt, clear: true });
    g.destroy();
    this.loadingTexture = rt;
    return rt;
  }

  private getLoadingBar(idx: number): TilingSprite {
    if (idx < this.loadingBarPool.length) return this.loadingBarPool[idx];
    const sprite = new TilingSprite({
      texture: this.ensureLoadingTexture(),
      width: 100,
      height: 28,
    });
    sprite.alpha = 0.85;
    this.loadingBarPool.push(sprite);
    this.loadingContainer.addChild(sprite);
    return sprite;
  }

  /**
   * Assign TilingSprite pool to currently visible loading tracks.
   * O(visible_rows) ≈ O(20) — safe to call on every frame including scroll-only.
   */
  private updateLoadingBars(
    loadingStart: number,
    loadingEnd: number,
    rowSize: number,
    effectiveTrackH: number,
    containerY: number,
    screenH: number,
    screenW: number,
    tileOffset: number,
  ) {
    if (loadingStart >= loadingEnd) {
      for (const bar of this.loadingBarPool) bar.visible = false;
      return;
    }
    // Compute visible track range using screen → local coord math.
    // localY = trackIndex * rowSize; screenY = containerY + localY
    // Visible: screenY + effectiveTrackH >= RULER_H  &&  screenY <= screenH
    const firstVis = Math.max(
      loadingStart,
      Math.floor((RULER_H - effectiveTrackH - containerY) / rowSize),
    );
    const lastVis = Math.min(
      loadingEnd - 1,
      Math.floor((screenH - containerY) / rowSize),
    );

    let bi = 0;
    for (let track = firstVis; track <= lastVis; track++) {
      const bar = this.getLoadingBar(bi++);
      bar.x = 0;
      bar.y = track * rowSize;
      bar.width = screenW;
      bar.height = effectiveTrackH;
      bar.tilePosition.x = -tileOffset;
      bar.visible = true;
    }
    for (let i = bi; i < this.loadingBarPool.length; i++) {
      this.loadingBarPool[i].visible = false;
    }
  }

  private hitTestEvent(
    canvasX: number,
    canvasY: number,
  ): import('../types').TemporalEvent | null {
    const { startMs, scrollY, zoom, scaleY } = this.state.viewport;
    const { trackHeight, trackGap } = this.config;
    const effectiveTrackH = trackHeight * scaleY;
    const rowSize = effectiveTrackH + Math.max(1, trackGap * scaleY);
    const screenW = this.app.screen.width;
    const PIN_MARGIN = 4;
    const HIT_SLOP = 3;

    // ── Left/right edge pin hit-test ────────────────────────────────────────
    if (canvasX <= PIN_MARGIN + MIN_BAR_W + HIT_SLOP) {
      for (const pin of this.leftPins) {
        if (
          canvasY >= pin.py - HIT_SLOP &&
          canvasY <= pin.py + pin.ph + HIT_SLOP
        ) {
          const meta = getGroupMeta(pin.poolIdx);
          if (meta) {
            const origin = this.dataOriginMs;
            const relStart = meta.startMs - origin;
            const relEnd = Math.max(meta.endMs - origin, relStart + 1);
            return {
              eventId: String(meta.headSlotIdx + 1),
              eventType: meta.pixiType,
              eventTime: meta.startMs,
              startMs: relStart,
              endMs: relEnd,
              status: meta.pixiStatus as import('../types').EventStatus,
              trackIndex: meta.trackIndex,
              attributes: {
                type: meta.pixiType,
                durationMs: relEnd - relStart,
              },
              poolIdx: pin.poolIdx,
            };
          }
        }
      }
    }
    if (canvasX >= screenW - PIN_MARGIN - MIN_BAR_W - HIT_SLOP) {
      for (const pin of this.rightPins) {
        if (
          canvasY >= pin.py - HIT_SLOP &&
          canvasY <= pin.py + pin.ph + HIT_SLOP
        ) {
          const meta = getGroupMeta(pin.poolIdx);
          if (meta) {
            const origin = this.dataOriginMs;
            const relStart = meta.startMs - origin;
            const relEnd = Math.max(meta.endMs - origin, relStart + 1);
            return {
              eventId: String(meta.headSlotIdx + 1),
              eventType: meta.pixiType,
              eventTime: meta.startMs,
              startMs: relStart,
              endMs: relEnd,
              status: meta.pixiStatus as import('../types').EventStatus,
              trackIndex: meta.trackIndex,
              attributes: {
                type: meta.pixiType,
                durationMs: relEnd - relStart,
              },
              poolIdx: pin.poolIdx,
            };
          }
        }
      }
    }

    // ── Gutter pin hit-test (above/below scroll area) ──────────────────────
    for (const pin of [...this.topPins, ...this.bottomPins]) {
      if (
        canvasX >= pin.px - HIT_SLOP &&
        canvasX <= pin.px + pin.pw + HIT_SLOP &&
        canvasY >= pin.py - HIT_SLOP &&
        canvasY <= pin.py + pin.ph + HIT_SLOP
      ) {
        const meta = getGroupMeta(pin.poolIdx);
        if (meta) {
          const origin = this.dataOriginMs;
          const relStart = meta.startMs - origin;
          const relEnd = Math.max(meta.endMs - origin, relStart + 1);
          return {
            eventId: String(meta.headSlotIdx + 1),
            eventType: meta.pixiType,
            eventTime: meta.startMs,
            startMs: relStart,
            endMs: relEnd,
            status: meta.pixiStatus as EventStatus,
            trackIndex: meta.trackIndex,
            attributes: { type: meta.pixiType, durationMs: relEnd - relStart },
            poolIdx: pin.poolIdx,
          };
        }
      }
    }

    if (canvasY < RULER_H) return null;

    const clickMs = startMs + canvasX / zoom;
    const trackIndex = Math.floor((canvasY - RULER_H + scrollY) / rowSize);
    const slop = 2 / zoom;

    const origin = this.dataOriginMs;
    const count = this.currentArgs.poolCount;
    if (!isNaN(origin) && count > 0) {
      for (let i = 0; i < count; i++) {
        const meta = getGroupMeta(i);
        if (
          !meta ||
          meta.pixiType === 'GROUP_WORKFLOW_TASK' ||
          meta.trackIndex !== trackIndex
        )
          continue;
        const relStart = meta.startMs - origin;
        const relEnd = Math.max(meta.endMs - origin, relStart + 1);
        // Extend the hit zone to cover the visual minimum-width bar.
        const renderedEndMs = Math.max(relEnd, relStart + MIN_BAR_W / zoom);
        if (clickMs >= relStart - slop && clickMs <= renderedEndMs + slop) {
          return {
            eventId: String(meta.headSlotIdx + 1),
            eventType: meta.pixiType,
            eventTime: meta.startMs,
            startMs: relStart,
            endMs: relEnd,
            status: meta.pixiStatus as EventStatus,
            trackIndex: meta.trackIndex,
            attributes: {
              type: meta.pixiType,
              durationMs: relEnd - relStart,
            },
            poolIdx: i,
          };
        }
      }
    }
    return null;
  }

  private drawRuler(
    startMs: number,
    zoom: number,
    screenW: number,
    screenH: number,
  ) {
    const intervalMs = pickTickInterval(zoom);
    const firstTick = Math.ceil(startMs / intervalMs) * intervalMs;
    const dataStart = this.state.dataRange.startMs;

    this.gridGfx.clear();
    this.rulerGfx.clear();

    this.rulerGfx
      .rect(0, 0, screenW, RULER_H)
      .fill({ color: 0x060610, alpha: 1 });
    this.rulerGfx.rect(0, RULER_H - 1, screenW, 1).fill({ color: 0x1e293b });

    let li = 0;
    for (
      let tickMs = firstTick;
      tickMs <= startMs + screenW / zoom;
      tickMs += intervalMs
    ) {
      const x = (tickMs - startMs) * zoom;
      if (x < 0 || x > screenW) continue;

      this.gridGfx
        .moveTo(x, RULER_H)
        .lineTo(x, screenH)
        .stroke({ color: 0x1e293b, width: 1, alpha: 0.7 });

      this.rulerGfx
        .moveTo(x, RULER_H - 7)
        .lineTo(x, RULER_H - 1)
        .stroke({ color: 0x334155, width: 1 });

      const label = this.getLabel(li++);
      label.text = formatTickLabel(tickMs - dataStart, intervalMs);
      label.x = x + 3;
      label.y = RULER_H / 2;
      label.visible = true;
    }

    for (let i = li; i < this.labelPool.length; i++) {
      this.labelPool[i].visible = false;
    }
  }

  private render() {
    ensureBitmapFonts();

    if (this.hasPendingWheel) {
      this.hasPendingWheel = false;
      if (this.pendingWheelDX !== 0) {
        this.state.viewport.startMs = this.clampStartMs(
          this.state.viewport.startMs +
            this.pendingWheelDX / this.state.viewport.zoom,
        );
        this.pendingWheelDX = 0;
      }
      if (this.pendingZoomFactor !== 1) {
        this.applyZoom(
          this.pendingZoomFactor,
          this.pendingZoomCX,
          this.pendingZoomCY,
        );
        this.pendingZoomFactor = 1;
      }
    }

    const { viewport } = this.state;
    const { startMs, scrollY, zoom, scaleY } = viewport;
    const { trackHeight, trackGap } = this.config;

    const effectiveTrackH = trackHeight * scaleY;
    const effectiveTrackGap = Math.max(1, trackGap * scaleY);
    const rowSize = effectiveTrackH + effectiveTrackGap;

    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    if (screenW < 1 || screenH < 1) return;

    const newEndMs = startMs + screenW / zoom;
    if (this.state.viewport.endMs !== newEndMs)
      this.state.viewport.endMs = newEndMs;

    const newMaxScrollY = this.maxScrollY();
    if (this.state.maxScrollY !== newMaxScrollY)
      this.state.maxScrollY = newMaxScrollY;

    // ── Hover flush — update cursor once per rAF, not per pointermove ────────
    if (this.hasPendingHover) {
      this.hasPendingHover = false;
      this.canvasRect = this.canvas.getBoundingClientRect();
      const hx = this.pendingHoverClientX - this.canvasRect.left;
      const hy = this.pendingHoverClientY - this.canvasRect.top;
      const hit = this.hitTestEvent(hx, hy);
      const cursor = hit ? 'pointer' : 'default';
      if (cursor !== this.lastCursor) {
        this.canvas.style.cursor = cursor;
        this.lastCursor = cursor;
      }
    }

    // scrollContainer.y positions all events/loading bars relative to the ruler.
    // Vertical scroll only moves this container — no geometry rebuild needed.
    const containerY = RULER_H - scrollY;

    const tileOffset = (performance.now() / 1000) * 48;
    const tileChanged = Math.abs(tileOffset - this.lastTileOffset) >= 0.5;

    // Requires a full draw-call rebuild when geometry changes or scroll position changes.
    // Scroll must rebuild so Y-culling uses the current scrollY (only visible tracks drawn).
    const needsGeometry =
      this.dirty ||
      startMs !== this.lastStartMs ||
      zoom !== this.lastZoom ||
      scrollY !== this.lastScrollY ||
      screenW !== this.lastScreenW ||
      screenH !== this.lastScreenH;

    if (!needsGeometry && !tileChanged) return;

    const poolCount = this.currentArgs.poolCount;
    const totalRows = Math.max(
      this.currentArgs.totalRows,
      getVisibleGroupCount(),
    );
    const descCount = this.currentArgs.descCount;
    const ascCount = this.currentArgs.ascCount;
    // Loading gap sits between the desc section (top) and asc section (bottom).
    const loadingStart = descCount;
    const loadingEnd = Math.max(descCount, totalRows - ascCount);

    // Animation-only fast path (shimmer tick, no scroll/pan/zoom change).
    if (!needsGeometry && tileChanged) {
      this.lastTileOffset = tileOffset;
      this.updateLoadingBars(
        loadingStart,
        loadingEnd,
        rowSize,
        effectiveTrackH,
        containerY,
        screenH,
        screenW,
        tileOffset,
      );
      this.app.renderer.render(this.app.stage);
      return;
    }

    // Full geometry path — pan, zoom, resize, scroll, or dirty.
    this.dirty = false;
    this.lastStartMs = startMs;
    this.lastScrollY = scrollY;
    this.lastZoom = zoom;
    this.lastScreenW = screenW;
    this.lastScreenH = screenH;
    if (tileChanged) this.lastTileOffset = tileOffset;

    this.scrollContainer.y = containerY;
    this.drawRuler(startMs, zoom, screenW, screenH);

    // Loading bars — tracks in the gap between desc section and asc section.
    this.updateLoadingBars(
      loadingStart,
      loadingEnd,
      rowSize,
      effectiveTrackH,
      containerY,
      screenH,
      screenW,
      tileOffset,
    );

    // Event bars — read directly from the buffer pool, no intermediate copy.
    this.baseGfx.clear();
    this.eventLabelIndex = 0;
    this.iconSpriteIndex = 0;
    this.leftPins = [];
    this.rightPins = [];
    this.pinnedPoolIdxs.clear();
    let visibleCount = 0;
    const radius = Math.max(2, Math.min(4, effectiveTrackH * 0.15));
    const PIN_MARGIN = 4;
    const origin = this.dataOriginMs;
    if (!isNaN(origin)) {
      for (let i = 0; i < poolCount; i++) {
        const meta = getGroupMeta(i);
        if (!meta || meta.pixiType === 'GROUP_WORKFLOW_TASK') continue;

        const relStart = meta.startMs - origin;
        const relEnd = Math.max(meta.endMs - origin, relStart + 1);

        const rawX = (relStart - startMs) * zoom;
        const rawW = Math.max(MIN_BAR_W, (relEnd - relStart) * zoom);
        const localY = meta.trackIndex * rowSize;
        const screenY = containerY + localY;

        if (screenY + effectiveTrackH < RULER_H || screenY > screenH) continue;

        const color = EVENT_COLORS[meta.pixiType] ?? EVENT_COLORS.default;
        const alpha = STATUS_ALPHA[meta.pixiStatus] ?? 1.0;

        // ── Left/right edge pin detection ───────────────────────────────────
        const isLeftPin = rawX + rawW < PIN_MARGIN + MIN_BAR_W;
        const isRightPin = rawX > screenW - PIN_MARGIN;

        let drawX = rawX;
        let drawW = rawW;
        if (isLeftPin) {
          drawX = PIN_MARGIN;
          drawW = MIN_BAR_W;
          this.leftPins.push({ poolIdx: i, py: screenY, ph: effectiveTrackH });
          this.pinnedPoolIdxs.add(i);
        } else if (isRightPin) {
          drawX = screenW - PIN_MARGIN - MIN_BAR_W;
          drawW = MIN_BAR_W;
          this.rightPins.push({ poolIdx: i, py: screenY, ph: effectiveTrackH });
          this.pinnedPoolIdxs.add(i);
        } else if (rawX + rawW < 0 || rawX > screenW) {
          continue;
        }

        visibleCount++;
        this.baseGfx
          .roundRect(drawX, localY, drawW, effectiveTrackH, radius)
          .fill({ color, alpha });

        const barMidY = localY + effectiveTrackH / 2;

        // ── SVG icon + display name ──────────────────────────────────────────
        const barLeft = Math.max(0, drawX);
        const barRight = Math.min(screenW, drawX + drawW);
        const visibleW = barRight - barLeft;

        // SVG icon: always render when the icon texture is available.
        // MIN_BAR_W == ICON_SIZE + ICON_PAD*2 so the icon always fits.
        let iconPlaced = false;
        if (this.iconTextures && visibleW >= MIN_BAR_W) {
          const iconName = PIXI_TYPE_TO_ICON[meta.pixiType];
          if (iconName) {
            const sprite = this.getIconSprite();
            sprite.texture = this.iconTextures[iconName];
            sprite.x = barLeft + ICON_PAD;
            sprite.y = barMidY;
            sprite.width = ICON_SIZE;
            sprite.height = ICON_SIZE;
            sprite.visible = true;
            sprite.alpha = alpha;
            iconPlaced = true;
          }
        }

        // Text label: show display name after the icon (or letter+name if no icon).
        if (visibleW >= 8) {
          const name =
            meta.group?.displayName ??
            meta.pixiType
              .replace(/^(EVENT_TYPE_|GROUP_)/, '')
              .replace(/_/g, ' ');
          const textStart = iconPlaced
            ? barLeft + ICON_PAD + ICON_SIZE + 2
            : barLeft + 4;
          // Allow label to overflow bar rightward up to screen edge.
          const textAvailW = screenW - textStart - 4;
          if (textAvailW >= 6) {
            const labelText = iconPlaced
              ? PixiRenderer.fitName(name, textAvailW)
              : PixiRenderer.fitLabel(
                  PixiRenderer.iconLetter(meta.pixiType),
                  name,
                  textAvailW,
                );
            if (labelText) {
              const label = this.getEventLabel();
              label.text = labelText;
              label.x = textStart;
              label.y = barMidY;
              label.visible = true;
              label.alpha = 1;
            }
          }
        }
      }
    }

    if (this.state.visibleEvents !== visibleCount) {
      this.state.visibleEvents = visibleCount;
    }

    for (let i = this.eventLabelIndex; i < this.eventLabelPool.length; i++) {
      this.eventLabelPool[i].visible = false;
    }
    for (let i = this.iconSpriteIndex; i < this.iconSpritePool.length; i++) {
      this.iconSpritePool[i].visible = false;
    }

    // ── Gutter pins (events above / below the visible track range) ──────────
    this.drawGutterPins(
      startMs,
      zoom,
      rowSize,
      effectiveTrackH,
      containerY,
      screenW,
      screenH,
      radius,
    );

    this.app.renderer.render(this.app.stage);
  }

  /**
   * Render thin pin bars at the top and bottom of the canvas for events whose
   * track rows are off-screen.  Each off-screen track contributes at most one bar
   * per gutter row (the longest-duration event wins).
   */
  private drawGutterPins(
    startMs: number,
    zoom: number,
    rowSize: number,
    effectiveTrackH: number,
    containerY: number,
    screenW: number,
    screenH: number,
    _radius: number,
  ) {
    this.gutterTopGfx.clear();
    this.gutterBottomGfx.clear();
    this.topPins = [];
    this.bottomPins = [];
    this.gutterIconSpriteIndex = 0;
    // NOTE: pinnedPoolIdxs is cleared at the start of the render loop
    // (before left/right pins are collected). Top/bottom pins are additive.

    if (this.byTrack.length === 0) {
      for (const s of this.gutterIconSpritePool) s.visible = false;
      return;
    }

    const PIN_H = Math.max(12, Math.min(18, effectiveTrackH * 0.75));
    const PIN_MARGIN = 4;
    const MIN_PIN_W = PIN_H;
    const viewEndMs = startMs + screenW / zoom;

    const topEdge = RULER_H;
    // Clamp bottom edge to the visible portion of the canvas inside the browser viewport.
    // The canvas may overflow the window when the stats panel is open, so we must not
    // draw the bottom gutter below what the user can actually see.
    const visibleH = Math.min(
      screenH,
      Math.max(0, window.innerHeight - this.canvasRect.top),
    );
    const bottomEdge = visibleH;

    const aboveTracks: PinEvent[] = [];
    const belowTracks: PinEvent[] = [];

    for (let t = 0; t < this.byTrack.length; t++) {
      const trackEvents = this.byTrack[t];
      if (!trackEvents || trackEvents.length === 0) continue;

      const screenY = containerY + t * rowSize;
      const isAbove = screenY + effectiveTrackH < topEdge;
      const isBelow = screenY > bottomEdge;
      if (!isAbove && !isBelow) continue;

      // Pick the longest-duration event in this track that overlaps the viewport
      let best: PinEvent | null = null;
      for (const ev of trackEvents) {
        if (ev.endMs < startMs || ev.startMs > viewEndMs) continue;
        if (!best || ev.endMs - ev.startMs > best.endMs - best.startMs)
          best = ev;
      }
      if (!best) {
        // Fall back to longest event regardless of viewport overlap (gutter marker)
        for (const ev of trackEvents) {
          if (!best || ev.endMs - ev.startMs > best.endMs - best.startMs)
            best = ev;
        }
      }
      if (!best) continue;

      if (isAbove) aboveTracks.push(best);
      else belowTracks.push(best);
    }

    // Sort by horizontal position so the row-packing algorithm fills left-to-right.
    aboveTracks.sort((a, b) => a.startMs - b.startMs);
    belowTracks.sort((a, b) => a.startMs - b.startMs);

    const renderPins = (
      events: PinEvent[],
      side: 'top' | 'bottom',
      store: PinBar[],
      gfx: Graphics,
    ) => {
      const MAX_ROWS = 2;
      const rows: { event: PinEvent; px: number; pw: number }[][] = [];

      for (const ev of events) {
        const exStart = (ev.startMs - startMs) * zoom;
        const exEnd =
          exStart + Math.max(MIN_PIN_W, (ev.endMs - ev.startMs) * zoom);
        const px = Math.max(
          PIN_MARGIN,
          Math.min(screenW - PIN_MARGIN - MIN_PIN_W, exStart),
        );
        const pw = Math.max(
          MIN_PIN_W,
          Math.min(screenW - PIN_MARGIN - px, exEnd - px),
        );

        let row = -1;
        for (let r = 0; r < rows.length; r++) {
          const last = rows[r][rows[r].length - 1];
          if (!last || last.px + last.pw + 2 <= px) {
            row = r;
            break;
          }
        }
        if (row === -1) {
          if (rows.length >= MAX_ROWS) continue;
          row = rows.length;
          rows.push([]);
        }
        rows[row].push({ event: ev, px, pw });
      }

      for (let r = 0; r < rows.length; r++) {
        const py =
          side === 'top'
            ? topEdge + r * (PIN_H + 2)
            : bottomEdge - (rows.length - r) * (PIN_H + 2);

        for (const { event: ev, px, pw } of rows[r]) {
          const color = EVENT_COLORS[ev.pixiType] ?? EVENT_COLORS.default;
          const alpha = (STATUS_ALPHA[ev.pixiStatus] ?? 1.0) * 0.85;
          gfx.roundRect(px, py, pw, PIN_H, 2).fill({ color, alpha });

          if (this.iconTextures) {
            const iconName = PIXI_TYPE_TO_ICON[ev.pixiType];
            if (iconName && this.iconTextures[iconName]) {
              const {
                x: ix,
                y: iy,
                size: iSize,
              } = gutterIconLayout(px, py, pw, PIN_H);
              const sprite = this.getGutterIconSprite();
              sprite.texture = this.iconTextures[iconName];
              sprite.x = ix;
              sprite.y = iy;
              sprite.width = iSize;
              sprite.height = iSize;
              sprite.visible = true;
              sprite.alpha = alpha;
            }
          }
          store.push({ poolIdx: ev.poolIdx, px, py, pw, ph: PIN_H });
          this.pinnedPoolIdxs.add(ev.poolIdx);
        }
      }
    };

    renderPins(aboveTracks, 'top', this.topPins, this.gutterTopGfx);
    renderPins(belowTracks, 'bottom', this.bottomPins, this.gutterBottomGfx);

    for (
      let i = this.gutterIconSpriteIndex;
      i < this.gutterIconSpritePool.length;
      i++
    ) {
      this.gutterIconSpritePool[i].visible = false;
    }
  }

  /**
   * Scroll the viewport so the given event is visible.
   * Pass centerX=true for left/right pin clicks to also center the horizontal axis.
   */
  private scrollToEvent(
    event: { startMs: number; endMs: number; trackIndex: number },
    centerX = false,
  ) {
    const { viewport } = this.state;
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;
    const eventAreaH = screenH - RULER_H;
    const { trackHeight, trackGap } = this.config;
    const rowSize =
      trackHeight * viewport.scaleY + Math.max(1, trackGap * viewport.scaleY);

    const xStart = (event.startMs - viewport.startMs) * viewport.zoom;
    const xEnd = (event.endMs - viewport.startMs) * viewport.zoom;

    if (centerX || xEnd < 0 || xStart > screenW) {
      const centerMs = (event.startMs + event.endMs) / 2;
      const vpSpanMs = screenW / viewport.zoom;
      this.state.viewport.startMs = centerMs - vpSpanMs / 2;
    }

    const trackY = event.trackIndex * rowSize;
    this.state.viewport.scrollY = Math.max(
      0,
      Math.min(this.maxScrollY(), trackY - eventAreaH / 3 + rowSize / 2),
    );
    this.dirty = true;
  }

  private canvasPos(e: PointerEvent | MouseEvent): { x: number; y: number } {
    this.canvasRect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - this.canvasRect.left,
      y: e.clientY - this.canvasRect.top,
    };
  }

  private setupInteraction() {
    const { canvas } = this;

    canvas.addEventListener('pointerdown', (e) => {
      const pos = this.canvasPos(e);
      this.panState = {
        active: true,
        startX: pos.x,
        startY: pos.y,
        originStartMs: this.state.viewport.startMs,
        originScrollY: this.state.viewport.scrollY,
      };
      this.dirty = true;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (this.panState.active) {
        this.pendingPanClientX = e.clientX;
        this.pendingPanClientY = e.clientY;
        if (this.panFlushRafId === null) {
          this.panFlushRafId = requestAnimationFrame(() => {
            this.panFlushRafId = null;
            if (!this.panState.active) return;
            this.canvasRect = this.canvas.getBoundingClientRect();
            const x = this.pendingPanClientX - this.canvasRect.left;
            const y = this.pendingPanClientY - this.canvasRect.top;
            const deltaXMs =
              (x - this.panState.startX) / this.state.viewport.zoom;
            const deltaYPx = y - this.panState.startY;
            this.state.viewport.startMs = this.clampStartMs(
              this.panState.originStartMs - deltaXMs,
            );
            this.state.viewport.scrollY = Math.max(
              0,
              Math.min(
                this.maxScrollY(),
                this.panState.originScrollY - deltaYPx,
              ),
            );
          });
        }
        return;
      }
      // Hover tracking — flushed in render() to avoid per-pointermove DOM writes
      this.pendingHoverClientX = e.clientX;
      this.pendingHoverClientY = e.clientY;
      this.hasPendingHover = true;
    });

    canvas.addEventListener('pointerup', (e) => {
      if (!this.panState.active) return;
      if (this.panFlushRafId !== null) {
        cancelAnimationFrame(this.panFlushRafId);
        this.panFlushRafId = null;
      }
      const pos = this.canvasPos(e);
      const moved =
        Math.abs(pos.x - this.panState.startX) > 4 ||
        Math.abs(pos.y - this.panState.startY) > 4;
      this.panState.active = false;

      const hit = moved ? null : this.hitTestEvent(pos.x, pos.y);
      const cursor = hit ? 'pointer' : 'default';
      if (cursor !== this.lastCursor) {
        canvas.style.cursor = cursor;
        this.lastCursor = cursor;
      }

      if (!moved && hit) {
        // Determine if this came from a left/right pin (need to center X axis).
        const isXPin =
          this.pinnedPoolIdxs.has(hit.poolIdx ?? -1) &&
          (this.leftPins.some((p) => p.poolIdx === hit.poolIdx) ||
            this.rightPins.some((p) => p.poolIdx === hit.poolIdx));
        this.scrollToEvent(hit, isXPin);

        // Always clear current selection first (single panel at a time)
        for (const id of Object.keys(this.state.selectedEvents)) {
          this.ctx?.deselectEvent(id);
        }
        this.ctx?.toggleSelected(hit);
        this.dirty = true;
      } else if (!moved) {
        // Click on empty area — deselect all
        for (const id of Object.keys(this.state.selectedEvents)) {
          this.ctx?.deselectEvent(id);
        }
        this.dirty = true;
      }
    });

    canvas.addEventListener('pointerleave', () => {
      if (!this.panState.active) {
        this.hasPendingHover = false;
        if (this.lastCursor !== 'default') {
          canvas.style.cursor = 'default';
          this.lastCursor = 'default';
        }
      }
    });

    canvas.addEventListener(
      'wheel',
      (e) => {
        const isZoom = e.ctrlKey || e.shiftKey;
        const isHorizontal = !isZoom && Math.abs(e.deltaX) > Math.abs(e.deltaY);
        // Vertical-only scroll: let native overflow-y scroll handle it.
        if (!isZoom && !isHorizontal) return;

        e.preventDefault();
        e.stopPropagation();

        let dy = e.deltaY,
          dx = e.deltaX;
        if (e.deltaMode === 1) {
          dy *= 20;
          dx *= 20;
        }
        if (e.deltaMode === 2) {
          dy *= 400;
          dx *= 400;
        }

        if (isZoom) {
          const raw = dy !== 0 ? dy : dx;
          const factor = raw < 0 ? 1.15 : 1 / 1.15;
          this.pendingZoomFactor *= factor;
          this.pendingZoomCX = e.clientX;
          this.pendingZoomCY = e.clientY;
        } else {
          this.pendingWheelDX += Math.abs(dx) > Math.abs(dy) ? dx : dy;
        }
        this.hasPendingWheel = true;
      },
      { passive: false },
    );
  }

  private clampStartMs(startMs: number): number {
    return clampViewportStartMs(
      startMs,
      this.state.dataRange,
      this.state.viewport.zoom,
      this.app.screen.width || 1200,
    );
  }

  private applyZoom(factor: number, clientX: number, clientY: number) {
    const pos = {
      x: clientX - this.canvasRect.left,
      y: clientY - this.canvasRect.top,
    };
    const { viewport } = this.state;
    const { trackHeight, trackGap } = this.config;

    const newZoom = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, viewport.zoom * factor),
    );
    if (newZoom !== viewport.zoom) {
      const mouseMs = viewport.startMs + pos.x / viewport.zoom;
      this.state.viewport.zoom = newZoom;
      this.state.viewport.startMs = this.clampStartMs(
        mouseMs - pos.x / newZoom,
      );
    }

    const minScaleY = 12 / trackHeight;
    const newScaleY = Math.max(
      minScaleY,
      Math.min(5, viewport.scaleY * factor),
    );
    if (newScaleY !== viewport.scaleY) {
      const oldRowSize =
        trackHeight * viewport.scaleY + Math.max(1, trackGap * viewport.scaleY);
      const eventY = Math.max(0, pos.y - RULER_H);
      const trackUnderCursor = (eventY + viewport.scrollY) / oldRowSize;
      this.state.viewport.scaleY = newScaleY;
      const newRowSize =
        trackHeight * newScaleY + Math.max(1, trackGap * newScaleY);
      this.state.viewport.scrollY = Math.max(
        0,
        Math.min(this.maxScrollY(), trackUnderCursor * newRowSize - eventY),
      );
    }
  }

  destroy() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.panFlushRafId !== null) cancelAnimationFrame(this.panFlushRafId);
    this.resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.app.destroy({ removeView: false, releaseGlobalResources: true });
  }
}
