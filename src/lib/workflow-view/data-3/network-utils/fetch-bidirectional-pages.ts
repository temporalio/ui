type Direction = 'ascending' | 'descending';

export type PageFetcherFn<T> = (
  direction: Direction,
  token: string | undefined,
  signal: AbortSignal,
) => Promise<
  Readonly<{
    items: readonly T[];
    nextPageToken: string | null;
  }>
>;

type BidirectionalPageParams<T> = Readonly<{
  fetchPage: PageFetcherFn<T>;
  compare: (left: T, right: T) => number;
  onPage: (items: readonly T[]) => void;
  signal?: AbortSignal;
}>;

/** Delivers ordered pages from both ends until they meet or one end finishes. */
export async function fetchBidirectionalPages<T>({
  fetchPage,
  compare,
  onPage,
  signal,
}: BidirectionalPageParams<T>) {
  signal?.throwIfAborted();

  const ascendingController = new AbortController();
  const descendingController = new AbortController();

  let ascendingBoundary: { item: T } | null = null;
  let descendingBoundary: { item: T } | null = null;

  function abortBoth(): void {
    ascendingController.abort();
    descendingController.abort();
  }

  signal?.addEventListener('abort', abortBoth, { once: true });

  async function fetchDirection(
    direction: Direction,
    controller: AbortController,
    otherController: AbortController,
  ): Promise<void> {
    let token: string | undefined;

    while (!controller.signal.aborted) {
      let page: Awaited<ReturnType<PageFetcherFn<T>>>;

      try {
        page = await fetchPage(direction, token, controller.signal);
      } catch (error) {
        if (controller.signal.aborted) return;
        throw error;
      }

      if (controller.signal.aborted) return;

      onPage(page.items);

      if (page.items.length > 0) {
        const boundary = { item: page.items[page.items.length - 1] };

        if (direction === 'ascending') {
          ascendingBoundary = boundary;
        } else {
          descendingBoundary = boundary;
        }
      }

      const boundariesMet =
        ascendingBoundary !== null &&
        descendingBoundary !== null &&
        compare(ascendingBoundary.item, descendingBoundary.item) >= 0;

      if (boundariesMet || !page.nextPageToken) {
        otherController.abort();
        return;
      }

      if (page.nextPageToken === token) {
        throw new Error(`Repeated ${direction} page token`);
      }

      token = page.nextPageToken;
    }
  }

  try {
    const ascending = fetchDirection(
      'ascending',
      ascendingController,
      descendingController,
    );
    const descending = fetchDirection(
      'descending',
      descendingController,
      ascendingController,
    );

    try {
      await Promise.all([ascending, descending]);
    } catch (error) {
      abortBoth();
      await Promise.allSettled([ascending, descending]);
      throw error;
    }

    signal?.throwIfAborted();
  } finally {
    signal?.removeEventListener('abort', abortBoth);
  }
}
