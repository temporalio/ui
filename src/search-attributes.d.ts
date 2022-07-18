type SearchAttributesValue =
  | 'Bool'
  | 'Datetime'
  | 'Double'
  | 'Int'
  | 'Keyword'
  | 'Text';

type SearchAttributes = {
  [k: string]: SearchAttributesValue;
};

type SearchAttributesResponse = {
  keys: SearchAttributes;
};
