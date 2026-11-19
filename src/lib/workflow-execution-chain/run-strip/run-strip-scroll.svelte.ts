import { prefersReducedMotion } from 'svelte/motion';

import { tick, untrack } from 'svelte';

import {
  CAP_WIDTH,
  CARD_GAP,
  type RunSegment,
  TRAILING_PADDING,
} from './card-layout';

type RunStripScrollOptions = {
  getSegments: () => readonly RunSegment[];
  getLayoutKey: () => string;
  getSelectedRunId: () => string | null;
  isLive: () => boolean;
};

const EDGE_INSET = CAP_WIDTH + CARD_GAP;
const END_TOLERANCE = 2;

export const preferredScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion.current ? 'auto' : 'smooth';

export class RunStripScroll {
  scroller = $state<HTMLDivElement>();
  viewportWidth = $state(0);
  scrolledFromStart = $state(false);
  scrolledFromEnd = $state(false);
  selectedOutOfView = $state(false);

  private _stuckToEnd = true;
  private readonly _options: RunStripScrollOptions;

  constructor(options: RunStripScrollOptions) {
    this._options = options;

    $effect(() => {
      void options.getSelectedRunId();
      void options.isLive();
      untrack(() => void tick().then(() => this._followSelection()));
    });

    $effect(() => {
      void options.getLayoutKey();
      void this.viewportWidth;
      untrack(() => void tick().then(() => this._followLayout()));
    });
  }

  readonly onScroll = (): void => {
    if (!this.scroller) {
      return;
    }
    const { scrollLeft, clientWidth, scrollWidth } = this.scroller;
    this._stuckToEnd = scrollLeft + clientWidth >= scrollWidth - END_TOLERANCE;
    this.updateIndicators();
  };

  stickToEnd(): void {
    this._stuckToEnd = true;
  }

  updateIndicators(): void {
    if (!this.scroller) {
      return;
    }
    const { scrollLeft, clientWidth, scrollWidth } = this.scroller;
    this.scrolledFromStart = scrollLeft > 1;
    this.scrolledFromEnd = scrollLeft + clientWidth < scrollWidth - 1;
    const segment = this._selectedSegment;
    this.selectedOutOfView = Boolean(
      segment &&
      (segment.x + segment.width < scrollLeft + EDGE_INSET ||
        segment.x > scrollLeft + clientWidth - EDGE_INSET),
    );
  }

  scrollSelectedIntoView(): void {
    const segment = this._selectedSegment;
    if (!this.scroller || !segment) {
      return;
    }
    const left = segment.x - EDGE_INSET;
    const right = segment.x + segment.width + EDGE_INSET + TRAILING_PADDING;
    if (left < this.scroller.scrollLeft) {
      this.scroller.scrollTo({ left, behavior: preferredScrollBehavior() });
      return;
    }
    if (right > this.scroller.scrollLeft + this.scroller.clientWidth) {
      this.scroller.scrollTo({
        left: right - this.scroller.clientWidth,
        behavior: preferredScrollBehavior(),
      });
    }
  }

  private get _selectedSegment(): RunSegment | undefined {
    const selectedRunId = this._options.getSelectedRunId();
    return this._options
      .getSegments()
      .find((segment) => segment.id === selectedRunId);
  }

  private _followSelection(): void {
    if (this._options.isLive()) {
      this._keepEndInView();
    } else {
      this.scrollSelectedIntoView();
    }
    this.updateIndicators();
  }

  private _followLayout(): void {
    if (this._options.isLive()) {
      this._keepEndInView();
    }
    this.updateIndicators();
  }

  private _keepEndInView(): void {
    if (!this.scroller || !this._stuckToEnd) {
      return;
    }
    this.scroller.scrollLeft = this.scroller.scrollWidth;
  }
}
