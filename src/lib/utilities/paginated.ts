import type {
  NextPageToken,
  PaginationCallbacks,
  WithNextPageToken,
  WithoutNextPageToken,
} from '$lib/types/global';

import { handleError } from './handle-error';
import { isFunction } from './is-function';
import { merge } from './merge';

type PaginatedOptions<T> = PaginationCallbacks<T> & {
  token?: NextPageToken;
  previousProps?: WithoutNextPageToken<T>;
};

/**
 * Takes a function that receives a `nextPageToken`. If the promise
 * returned from that function has a `nextPageToken`, this function
 * will recursively call the function again, passing in the new
 * `nextPageToken`.
 *
 * - `onStart` fires at the beginning.
 * - `onUpdate` fires on each exection.
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
    token,
    previousProps,
  }: PaginatedOptions<T> = {},
): Promise<WithoutNextPageToken<T>> => {
  if (!previousProps && isFunction(onStart)) onStart();

  try {
    const response = await fn(token);
    const { nextPageToken, ...props } = response;
    const mergedProps = merge(previousProps, props);

    if (isFunction(onUpdate)) onUpdate(mergedProps, props);

    if (!nextPageToken) {
      if (isFunction(onComplete)) onComplete(mergedProps);
      return mergedProps;
    }

    return paginated(fn, {
      onStart,
      onUpdate,
      onComplete,
      token: nextPageToken,
      previousProps: mergedProps,
    });
  } catch (error: unknown) {
    onError(error);
  }
};
