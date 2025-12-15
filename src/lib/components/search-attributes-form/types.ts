export interface SearchAttributeDefinition {
  name?: string;
  type?: string;
  isDeletable?: boolean;
}

export interface SearchAttributeTypeOption {
  label: string;
  value: string;
}

export interface SearchAttributesFormData extends Record<string, unknown> {
  attributes: SearchAttributeDefinition[];
}

export interface SearchAttributesAdapter {
  fetchAttributes(): Promise<SearchAttributeDefinition[]>;
  upsertAttributes(attributes: SearchAttributeDefinition[]): Promise<void>;
  deleteAttribute(attributeName: string): Promise<void>;
  getSupportedTypes(): SearchAttributeTypeOption[];
  onSuccess?: (attributes: SearchAttributeDefinition[]) => Promise<void>;
  onCancel?: () => void;
}
