import type {
  SearchAttributes,
  SearchAttributeType,
} from '$lib/types/workflows';

export type SearchAttributeFilter = {
  attribute: Extract<keyof SearchAttributes, string>;
  type: SearchAttributeType;
  value: string;
  operator: string;
  parenthesis: string;
  conditional: string;
  customDate?: boolean;
};
