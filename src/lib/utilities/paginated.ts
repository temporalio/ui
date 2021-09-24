import isFunction from 'lodash/isFunction';
import { merge } from './merge';

type NextPageToken = Uint8Array | string;
type WithNextPageToken = { nextPageToken?: NextPageToken };
type PaginatedOptions<T> = {
  onStart?: () => void;
  onUpdate?: (
    full: Omit<T, keyof WithNextPageToken>,
    current: Omit<T, keyof WithNextPageToken>,
  ) => void;
  onComplete?: (finalProps: Omit<T, keyof WithNextPageToken>) => void;
  token?: NextPageToken;
  previousProps?: Omit<T, keyof WithNextPageToken>;
};

export const paginated = async <T extends WithNextPageToken>(
  fn: (token?: NextPageToken) => Promise<T>,
  { onStart, onUpdate, onComplete, token, previousProps }: PaginatedOptions<T>,
): Promise<Omit<T, keyof WithNextPageToken>> => {
  if (!previousProps && isFunction(onStart)) onStart();

  const { nextPageToken, ...props } = await fn(token);
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
};
