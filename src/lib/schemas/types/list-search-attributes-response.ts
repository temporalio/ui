import { z } from 'zod';

export const ListSearchAttributesResponse = z.object({
  /**Mapping between custom (user-registered) search attribute name to its IndexedValueType.*/
  customAttributes: z
    .record(
      z.enum([
        'INDEXED_VALUE_TYPE_UNSPECIFIED',
        'INDEXED_VALUE_TYPE_TEXT',
        'INDEXED_VALUE_TYPE_KEYWORD',
        'INDEXED_VALUE_TYPE_INT',
        'INDEXED_VALUE_TYPE_DOUBLE',
        'INDEXED_VALUE_TYPE_BOOL',
        'INDEXED_VALUE_TYPE_DATETIME',
        'INDEXED_VALUE_TYPE_KEYWORD_LIST',
      ]),
    )
    .describe(
      'Mapping between custom (user-registered) search attribute name to its IndexedValueType.',
    )
    .optional(),
  /**Mapping between system (predefined) search attribute name to its IndexedValueType.*/
  systemAttributes: z
    .record(
      z.enum([
        'INDEXED_VALUE_TYPE_UNSPECIFIED',
        'INDEXED_VALUE_TYPE_TEXT',
        'INDEXED_VALUE_TYPE_KEYWORD',
        'INDEXED_VALUE_TYPE_INT',
        'INDEXED_VALUE_TYPE_DOUBLE',
        'INDEXED_VALUE_TYPE_BOOL',
        'INDEXED_VALUE_TYPE_DATETIME',
        'INDEXED_VALUE_TYPE_KEYWORD_LIST',
      ]),
    )
    .describe(
      'Mapping between system (predefined) search attribute name to its IndexedValueType.',
    )
    .optional(),
  /**Mapping from the attribute name to the visibility storage native type.*/
  storageSchema: z
    .record(z.string())
    .describe(
      'Mapping from the attribute name to the visibility storage native type.',
    )
    .optional(),
});
export type ListSearchAttributesResponse = z.infer<
  typeof ListSearchAttributesResponse
>;
