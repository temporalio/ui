import { writable, get } from 'svelte/store';

export const searchAttributes = writable<SearchAttributes>();

export const searchAttributeOptions = () => {
  const attributes = get(searchAttributes);
  return attributes
    ? Object.entries(attributes).map(([key, value]) => {
      return {
        label: key,
        value: key,
        type: value,
      };
    })
    : [];
};
