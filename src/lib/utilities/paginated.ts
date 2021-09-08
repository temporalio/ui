import { merge } from './merge';

type NextPageToken = Uint8Array | string;
type WithNextPageToken = { nextPageToken: NextPageToken };

export const paginated = async <T extends WithNextPageToken>(
  fn: (token?: NextPageToken) => Promise<T>,
  onUpdate?: (
    current: Omit<T, keyof WithNextPageToken>,
    full: Omit<T, keyof WithNextPageToken>,
  ) => void,
  token?: NextPageToken,
  previousProps?: Omit<T, keyof WithNextPageToken>,
): Promise<Omit<T, keyof WithNextPageToken>> => {
  const { nextPageToken, ...props } = await fn(token);
  const mergedProps = merge(previousProps, props);

  if (!nextPageToken) return mergedProps;
  if (onUpdate) onUpdate(props, mergedProps);

  return paginated(fn, onUpdate, nextPageToken, mergedProps);
};
