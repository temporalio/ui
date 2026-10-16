import type { TimeRange } from './time-viewport';
import { getViewportScrollLeft } from './viewport-anchor';

export type ViewportInteraction = 'pan' | 'zoom';

export function getViewportDuration(
  requestedMs: number,
  live: boolean,
  minimumRenderMs = 1,
): number {
  return Math.max(requestedMs, live ? 10_000 : 1, minimumRenderMs);
}

export function getWheelInteraction(
  deltaX: number,
  deltaY: number,
): ViewportInteraction {
  return Math.abs(deltaX) > Math.abs(deltaY) ? 'pan' : 'zoom';
}

export function getFollowAfterInteraction(
  pinned: boolean,
  interaction: ViewportInteraction,
  horizontalOffset: number,
): boolean {
  return pinned && (interaction === 'zoom' || horizontalOffset >= 0);
}

export function getBufferedPlotEndMs(endMs: number, live: boolean): number {
  return live ? Math.ceil(endMs / 1000) * 1000 + 1000 : endMs;
}

export function getLiveScrollLeft(
  domain: TimeRange,
  plotDomain: TimeRange,
  contentWidth: number,
  viewportWidth: number,
): number {
  const effectiveDuration =
    (viewportWidth / contentWidth) * (plotDomain.endMs - plotDomain.startMs);
  const startMs = Math.max(
    plotDomain.startMs,
    domain.endMs - effectiveDuration,
  );
  return getViewportScrollLeft(startMs, plotDomain, contentWidth);
}
