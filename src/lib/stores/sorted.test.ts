import { get, writable } from 'svelte/store';
import { sorted } from './sorted';

const musicians = [
  { name: 'Jack White', birthYear: 1975 },
  { name: 'J Mascis', birthYear: 1965 },
  { name: 'Kurt Vile', birthYear: 1980 },
  { name: 'Jessica Dobson', birthYear: 1984 },
  { name: 'John Frusciante', birthYear: 1970 },
  { name: 'Bartees Strange', birthYear: 1989 },
];

describe('sorted', () => {
  it('should have a "subscribe" method', () => {
    const store = writable(musicians);
    const sortedStore = sorted(store);

    expect(sortedStore.subscribe).toBeDefined();
  });

  it('should sort the items ascendingly by default', () => {
    const store = writable(musicians);
    const sortedStore = sorted(store, 'birthYear');
    const [oldest] = get(sortedStore);

    expect(oldest.name).toEqual('J Mascis');
  });

  it('should sort the items ascendingly explicitly', () => {
    const store = writable(musicians);
    const sortedStore = sorted(store, 'birthYear', 'ascending');
    const [oldest] = get(sortedStore);

    expect(oldest.name).toEqual('J Mascis');
  });

  it('should sort the items descendingly explicitly', () => {
    const store = writable(musicians);
    const sortedStore = sorted(store, 'birthYear', 'descending');
    const [youngest] = get(sortedStore);

    expect(youngest.name).toEqual('Bartees Strange');
  });

  it('should sort have the ability to change the sort order', () => {
    const store = writable(musicians);
    const sortedStore = sorted(store, 'birthYear', 'descending');

    sortedStore.setOrder('ascending');

    const [oldest] = get(sortedStore);

    expect(oldest.name).toEqual('J Mascis');
  });

  it.only('should sort have the ability to change property', () => {
    const store = writable(musicians);
    const sortedStore = sorted(store, 'birthYear', 'descending');

    sortedStore.setProperty('name');

    const [kurt] = get(sortedStore);

    expect(kurt.name).toEqual('Kurt Vile');
  });
});
