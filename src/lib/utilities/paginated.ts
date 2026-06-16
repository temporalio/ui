import type {
  NextPageToken,
  PaginationCallbacks,
  WithNextPageToken,
  WithoutNextPageToken,
} from '$lib/types/global';

import { handleError } from './handle-error';
import { isFunction } from './is-function';
import { merge } from './merge';

/**
 * Takes a function that receives a `nextPageToken` and iterates through
 * all pages, merging results. Replaces the previous recursive implementation
 * to avoid holding N intermediate merged arrays on the async call stack,
 * which caused O(N²) peak memory for large histories.
 *
 * - `onStart` fires at the beginning.
 * - `onUpdate` fires on each execution with (accumulated, currentPage).
 * - `onComplete` fires when there are no more `nextPageTokens`.
 * - `onError` fires when a promise is rejected.
 */

export const paginated = async <T extends WithNextPageToken>(
  fn: (token?: NextPageToken) => Promise<T>,
  {
    onStart,
    onUpdate,
    onComplete,
    onError = handleError,
  }: PaginationCallbacks<T> = {},
): Promise<WithoutNextPageToken<T>> => {
  if (isFunction(onStart)) onStart();

  let token: NextPageToken | undefined = undefined;
  let accumulated: WithoutNextPageToken<T> | undefined = undefined;

  while (true) {
    try {
      const response = await fn(token);
      if (!response) return accumulated;

      const { nextPageToken, ...props } = response;
      accumulated = merge(accumulated, props as WithoutNextPageToken<T>);

      if (isFunction(onUpdate))
        onUpdate(accumulated, props as WithoutNextPageToken<T>);

      if (!nextPageToken) {
        if (isFunction(onComplete)) onComplete(accumulated);
        return accumulated;
      }

      token = nextPageToken;
    } catch (error: unknown) {
      onError(error);
      return accumulated;
    }
  }
};
