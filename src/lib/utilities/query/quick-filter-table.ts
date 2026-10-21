import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
  type SearchAttributeType,
} from '$lib/types/workflows';

import { type QuickFilterValue, toQuickFilterValue } from './quick-filter';

// Everything that differs between one quick filterable table and the next. A
// new table needs one of these and nothing else.
export type QuickFilterColumns<Row> = {
  // Column label to the search attribute it filters on. A label with no entry
  // is taken to be a custom search attribute, whose label is its name.
  attributes: Record<string, string>;
  // The value behind the cell, which is not always the text the cell renders.
  getValue: (label: string, row: Row) => QuickFilterValue;
  // Labels that must never offer a filter, whatever their value.
  unfilterable?: readonly string[];
};

export type ResolvedQuickFilter = {
  attribute: string;
  type: SearchAttributeType | undefined;
  value: QuickFilterValue;
  filterValue: string | null;
  filterable: boolean;
  displayValue: string | undefined;
};

export const getColumnAttribute = (
  attributes: Record<string, string>,
  label: string,
): string => attributes[label] ?? label;

export const resolveQuickFilter = <Row>({
  columns,
  searchAttributes,
  label,
  row,
}: {
  columns: QuickFilterColumns<Row>;
  searchAttributes: SearchAttributes;
  label: string;
  row: Row;
}): ResolvedQuickFilter => {
  const attribute = getColumnAttribute(columns.attributes, label);
  const type = searchAttributes[attribute];
  const value = columns.getValue(label, row);
  const filterValue = toQuickFilterValue({ attribute, type, value });

  return {
    attribute,
    type,
    value,
    filterValue,
    filterable: filterValue !== null && !columns.unfilterable?.includes(label),
    // A Datetime cell displays and copies the normalized value, so the text in
    // the cell and the value the filter uses cannot drift apart. A cell with no
    // value stays undefined, so it renders nothing rather than an empty badge.
    displayValue:
      type === SEARCH_ATTRIBUTE_TYPE.DATETIME
        ? (filterValue ?? undefined)
        : Array.isArray(value)
          ? value.join(', ')
          : value === undefined || value === null
            ? undefined
            : String(value),
  };
};
