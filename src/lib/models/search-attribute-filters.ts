import type {
  SearchAttributes,
  SearchAttributeType,
} from '$lib/types/workflows';

let nextFilterId = 0;
export const generateFilterId = (): string => `filter-${nextFilterId++}`;

export type SearchAttributeFilter = {
  id: string;
  attribute: Extract<keyof SearchAttributes, string>;
  type: SearchAttributeType;
  value: string;
  operator: string;
  parenthesis: string;
  conditional: string;
  customDate?: boolean;
};
