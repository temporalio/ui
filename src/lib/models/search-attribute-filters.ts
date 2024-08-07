import type {
  SearchAttributes,
  SearchAttributesValue,
} from '$lib/types/workflows';

export type SearchAttributeFilter = {
  attribute: Extract<keyof SearchAttributes, string>;
  type: SearchAttributesValue;
  value: string;
  operator: string;
  parenthesis: string;
  conditional: string;
  customDate?: boolean;
};
