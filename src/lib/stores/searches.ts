import { get } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const searches = persistStore<
  { name: string; query: string; filters: any[]; sorts: any[] }[]
>('searches', null);

export const saveSearch = (search: {
  name: string;
  query: string;
  filters: any[];
  sorts: any[];
}): void => {
  let _searches: {
    name: string;
    query: string;
    filters: any[];
    sorts: any[];
  }[] = get(searches) ?? [];
  const existingSearch = _searches.find((s) => s.name === search.name);
  if (existingSearch) {
    _searches = _searches.map((s) => {
      if (s.name === existingSearch.name) return search;
      return s;
    });
  } else {
    _searches = [..._searches, search];
  }

  searches.set(_searches);
};

export const removeSearch = (search: {
  name: string;
  query: string;
  filters: any[];
  sorts: any[];
}): void => {
  let _searches: {
    name: string;
    query: string;
    filters: any[];
    sorts: any[];
  }[] = get(searches) ?? [];
  _searches = _searches.filter((s) => {
    return s.name !== search.name;
  });
  searches.set(_searches);
};
