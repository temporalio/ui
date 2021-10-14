import type { Readable } from 'svelte/store';
import { derived, writable } from 'svelte/store';

type Order = 'ascending' | 'descending';

export type SortedStore<T> = Readable<T[]> & {
  setProperty: (p: keyof T) => void;
  setOrder: (o: Order) => void;
};

const asc =
  <T>(property: keyof T) =>
  (a: T, b: T): number => {
    return Number(a[property]) - Number(b[property]);
  };

const desc =
  <T>(property: keyof T) =>
  (a: T, b: T): number => {
    return Number(b[property]) - Number(a[property]);
  };

export const sorted = <T>(
  store: Readable<T[]>,
  prop: keyof T = null,
  defaultOrder: Order = 'ascending',
): SortedStore<T> => {
  const order = writable<Order>(defaultOrder);
  const property = writable<keyof T>(prop);

  const sortedStore = derived(
    [store, order, property],
    ([$store, $order, $property]) => {
      const operator =
        $order === 'ascending' ? asc($property) : desc($property);
      console.log($order, $property);
      return $store.sort(operator);
    },
  );

  return {
    ...sortedStore,
    setProperty(p: keyof T) {
      property.set(p);
    },
    setOrder(o: Order) {
      order.set(o);
    },
  };
};
