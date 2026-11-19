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
    let selectionAnchor: { id: string; x: number } | null = null;
    let programmaticScrollLeft: number | null = null;

    const jumpTo = (left: number) => {
      scroller.scrollLeft = left;
      programmaticScrollLeft = scroller.scrollLeft;
    };

    const findSelectedSegment = () => {
      const selectedRunId = options.getSelectedRunId();
      return options.getSegments().find(({ id }) => id === selectedRunId);
    };

    const rememberSelectionAnchor = () => {
      const segment = findSelectedSegment();
      selectionAnchor = segment ? { id: segment.id, x: segment.x } : null;
    };

    const keepSelectionInPlace = () => {
      const segment = findSelectedSegment();
      if (!segment || segment.id !== selectionAnchor?.id) {
        return;
      }
      jumpTo(scroller.scrollLeft + segment.x - selectionAnchor.x);
    };

    const reportMetrics = () => {
      options.onMetricsChange(readScrollMetrics(scroller));
    };

    const keepEndInView = () => {
      if (stuckToEnd) {
        jumpTo(scroller.scrollWidth);
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
      rememberSelectionAnchor();
      reportMetrics();
    };

    const holdScrollPosition = () => {
      if (options.isLive()) {
        keepEndInView();
        return;
      }
      keepSelectionInPlace();
    };

    const followLayout = () => {
      holdScrollPosition();
      rememberSelectionAnchor();
      reportMetrics();
    };

    const onScroll = () => {
      const scrolledByUs = scroller.scrollLeft === programmaticScrollLeft;
      programmaticScrollLeft = null;
      if (!scrolledByUs) {
        stuckToEnd =
          scroller.scrollLeft + scroller.clientWidth >=
          scroller.scrollWidth - END_TOLERANCE;
      }
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
