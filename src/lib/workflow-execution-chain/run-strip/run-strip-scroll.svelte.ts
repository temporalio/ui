import type { Attachment } from 'svelte/attachments';
import { prefersReducedMotion } from 'svelte/motion';

import { untrack } from 'svelte';

import {
  CAP_WIDTH,
  CARD_GAP,
  type RunSegment,
  TRAILING_PADDING,
} from './card-layout';

export type ScrollMetrics = {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
};

type ScrollIndicators = {
  scrolledFromStart: boolean;
  scrolledFromEnd: boolean;
};

type RunStripFollowAttachmentOptions = {
  getSegments: () => readonly RunSegment[];
  getLayoutKey: () => string;
  getSelectedRunId: () => string | null;
  isLive: () => boolean;
  onMetricsChange: (metrics: ScrollMetrics) => void;
  onFollowingEndChange: (followingEnd: boolean) => void;
};

const EDGE_INSET = CAP_WIDTH + CARD_GAP;
const END_TOLERANCE = 2;
const WIDTH_TRANSITION_MS = 350;

export const preferredScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion.current ? 'auto' : 'smooth';

const readScrollMetrics = ({
  scrollLeft,
  clientWidth,
  scrollWidth,
}: HTMLElement): ScrollMetrics => ({ scrollLeft, clientWidth, scrollWidth });

export const getScrollIndicators = (
  metrics: ScrollMetrics | undefined,
): ScrollIndicators => {
  if (!metrics) {
    return { scrolledFromStart: false, scrolledFromEnd: false };
  }
  const { scrollLeft, clientWidth, scrollWidth } = metrics;
  return {
    scrolledFromStart: scrollLeft > 1,
    scrolledFromEnd: scrollLeft + clientWidth < scrollWidth - 1,
  };
};

const scrollSegmentIntoView = (
  scroller: HTMLElement,
  segment: RunSegment,
): void => {
  const left = segment.x - EDGE_INSET;
  const right = segment.x + segment.width + EDGE_INSET + TRAILING_PADDING;
  if (left < scroller.scrollLeft) {
    scroller.scrollTo({ left, behavior: preferredScrollBehavior() });
    return;
  }
  if (right > scroller.scrollLeft + scroller.clientWidth) {
    scroller.scrollTo({
      left: right - scroller.clientWidth,
      behavior: preferredScrollBehavior(),
    });
  }
};

export const createRunStripFollowAttachment =
  (options: RunStripFollowAttachmentOptions): Attachment<HTMLElement> =>
  (scroller) => {
    let stuckToEnd = true;
    let wasLive = untrack(options.isLive);
    let visibleAnchor: { id: string; x: number } | null = null;
    let programmaticScrollLeft: number | null = null;
    let knownScrollLeft = scroller.scrollLeft;
    let followingEnd: boolean | null = null;

    const jumpTo = (left: number) => {
      scroller.scrollLeft = left;
      programmaticScrollLeft = scroller.scrollLeft;
      knownScrollLeft = scroller.scrollLeft;
    };

    const rememberVisibleAnchor = () => {
      const segment = options
        .getSegments()
        .find(({ x, width }) => x + width > scroller.scrollLeft + EDGE_INSET);
      visibleAnchor = segment ? { id: segment.id, x: segment.x } : null;
    };

    const keepVisibleCardsInPlace = () => {
      const anchor = visibleAnchor;
      const segment = anchor
        ? options.getSegments().find(({ id }) => id === anchor.id)
        : undefined;
      if (!anchor || !segment) {
        return;
      }
      jumpTo(scroller.scrollLeft + segment.x - anchor.x);
    };

    const reportFollowingEnd = () => {
      const following = options.isLive() && stuckToEnd;
      if (following === followingEnd) {
        return;
      }
      followingEnd = following;
      options.onFollowingEndChange(following);
    };

    const reportMetrics = () => {
      options.onMetricsChange(readScrollMetrics(scroller));
    };

    const readStuckToEnd = () =>
      scroller.scrollLeft + scroller.clientWidth >=
      scroller.scrollWidth - END_TOLERANCE;

    const noticeUnreportedScroll = () => {
      if (scroller.scrollLeft === knownScrollLeft) {
        return;
      }
      knownScrollLeft = scroller.scrollLeft;
      stuckToEnd = readStuckToEnd();
    };

    const keepEndInView = () => {
      noticeUnreportedScroll();
      if (stuckToEnd) {
        jumpTo(scroller.scrollWidth);
      }
    };

    let endPinFrame = 0;
    let endPinUntil = 0;

    const keepEndInViewWhileResizing = () => {
      endPinUntil = performance.now() + WIDTH_TRANSITION_MS;
      if (endPinFrame) {
        return;
      }
      const pinEnd = () => {
        keepEndInView();
        if (performance.now() >= endPinUntil) {
          endPinFrame = 0;
          return;
        }
        endPinFrame = requestAnimationFrame(pinEnd);
      };
      endPinFrame = requestAnimationFrame(pinEnd);
    };

    const scrollToSelection = (live: boolean, selectedRunId: string | null) => {
      if (live) {
        keepEndInView();
        return;
      }
      const segment = options
        .getSegments()
        .find(({ id }) => id === selectedRunId);
      if (segment) {
        scrollSegmentIntoView(scroller, segment);
      }
    };

    const followSelection = (live: boolean, selectedRunId: string | null) => {
      if (live && !wasLive) {
        stuckToEnd = true;
      }
      wasLive = live;
      scrollToSelection(live, selectedRunId);
      rememberVisibleAnchor();
      reportFollowingEnd();
      reportMetrics();
    };

    const holdScrollPosition = () => {
      noticeUnreportedScroll();
      if (options.isLive() && stuckToEnd) {
        keepEndInView();
        keepEndInViewWhileResizing();
        return;
      }
      keepVisibleCardsInPlace();
    };

    const followLayout = () => {
      holdScrollPosition();
      rememberVisibleAnchor();
      reportMetrics();
    };

    const onScroll = () => {
      const scrolledByUs = scroller.scrollLeft === programmaticScrollLeft;
      programmaticScrollLeft = null;
      knownScrollLeft = scroller.scrollLeft;
      if (!scrolledByUs) {
        stuckToEnd = readStuckToEnd();
      }
      rememberVisibleAnchor();
      reportFollowingEnd();
      reportMetrics();
    };

    $effect(() => {
      const live = options.isLive();
      const selectedRunId = options.getSelectedRunId();
      untrack(() => followSelection(live, selectedRunId));
    });

    $effect(() => {
      void options.getLayoutKey();
      untrack(followLayout);
    });

    const resizeObserver = new ResizeObserver(followLayout);
    resizeObserver.observe(scroller);
    scroller.addEventListener('scroll', onScroll);

    return () => {
      cancelAnimationFrame(endPinFrame);
      resizeObserver.disconnect();
      scroller.removeEventListener('scroll', onScroll);
    };
  };
