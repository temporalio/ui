import type { Readable, Writable } from 'svelte/store';
import { derived, writable } from 'svelte/store';

type Order = 'ascending' | 'descending';

export type SortedStore<T> = Readable<T[]> & {
  property: Writable<keyof T>;
  order: Writable<Order>;
};

const isNumber = (x: unknown): x is number => typeof x === 'number';
const isString = (x: unknown): x is string => typeof x === 'string';

const getValues = <T>(
  values: T[],
  property: keyof T,
  order: Order,
): [T[keyof T], T[keyof T]] => {
  const [x, y] = values.map((value) => value[property]);
  if (order === 'ascending') return [x, y];
  if (order === 'descending') return [y, x];
};

const compare =
  <T>(property: keyof T, order: Order) =>
  (a: T, b: T): number => {
    const [x, y] = getValues([a, b], property, order);

    if (isNumber(x) && isNumber(y)) {
      return x - y;
    }

    if (isString(x) && isString(y)) {
      if (x > y) return 1;
      if (x < y) return -1;
      return 0;
    }
  };

export const sorted = <T>(
  store: Readable<T[]>,
  prop: keyof T = null,
  defaultOrder: Order = 'ascending',
): SortedStore<T> => {
  const order = writable<Order>(defaultOrder);
  const property = writable<keyof T>(prop);

  const sortedStore = derived(
    [store, property, order],
    ([$store, $property, $order]) => {
      return $store.sort(compare($property, $order));
    },
  );

  return {
    ...sortedStore,
    order,
    property,
  };
};
