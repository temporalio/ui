export type SearchAttributesValue =
  | 'Bool'
  | 'Datetime'
  | 'Double'
  | 'Int'
  | 'Keyword'
  | 'Text';
export type SearchAttributes = {
  [k: string]: SearchAttributesValue;
};
export type SearchAttributesResponse = {
  keys: SearchAttributes;
};
