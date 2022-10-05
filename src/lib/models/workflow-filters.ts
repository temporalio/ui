export type WorkflowFilter = {
  attribute: keyof SearchAttributes;
  value: string;
  operator: string;
  parenthesis: string;
  conditional: string;
};

export type SortOrder = 'asc' | 'desc';

export type WorkflowSort = {
  attribute: keyof SearchAttributes;
  value: SortOrder;
};
