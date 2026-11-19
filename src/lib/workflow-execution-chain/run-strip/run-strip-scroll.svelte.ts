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

export type ScrollIndicators = {
  scrolledFromStart: boolean;
  scrolledFromEnd: boolean;
  selectedOutOfView: boolean;
};

type RunStripFollowAttachmentOptions = {
  getSegments: () => readonly RunSegment[];
  getLayoutKey: () => string;
  getSelectedRunId: () => string | null;
  isLive: () => boolean;
  onMetricsChange: (metrics: ScrollMetrics) => void;
};

const EDGE_INSET = CAP_WIDTH + CARD_GAP;
const END_TOLERANCE = 2;

export const preferredScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion.current ? 'auto' : 'smooth';

const readScrollMetrics = ({
  scrollLeft,
  clientWidth,
  scrollWidth,
}: HTMLElement): ScrollMetrics => ({ scrollLeft, clientWidth, scrollWidth });

export const getScrollIndicators = (
  metrics: ScrollMetrics | undefined,
  selectedSegment: RunSegment | undefined,
): ScrollIndicators => {
  if (!metrics) {
    return {
      scrolledFromStart: false,
      scrolledFromEnd: false,
      selectedOutOfView: false,
    };
  }
  const { scrollLeft, clientWidth, scrollWidth } = metrics;
  return {
    scrolledFromStart: scrollLeft > 1,
    scrolledFromEnd: scrollLeft + clientWidth < scrollWidth - 1,
    selectedOutOfView: Boolean(
      selectedSegment &&
      (selectedSegment.x + selectedSegment.width < scrollLeft + EDGE_INSET ||
        selectedSegment.x > scrollLeft + clientWidth - EDGE_INSET),
    ),
  };
};

export const scrollSegmentIntoView = (
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

    const reportMetrics = () => {
      options.onMetricsChange(readScrollMetrics(scroller));
    };

    const keepEndInView = () => {
      if (stuckToEnd) {
        scroller.scrollLeft = scroller.scrollWidth;
      }
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
      reportMetrics();
    };

    const followLayout = () => {
      if (options.isLive()) {
        keepEndInView();
      }
      reportMetrics();
    };

    const onScroll = () => {
      stuckToEnd =
        scroller.scrollLeft + scroller.clientWidth >=
        scroller.scrollWidth - END_TOLERANCE;
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
      resizeObserver.disconnect();
      scroller.removeEventListener('scroll', onScroll);
    };
  };
