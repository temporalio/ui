export interface SearchAttributeDefinition {
  name?: string;
  type?: string;
  isDeletable?: boolean;
  isExisting?: boolean;
  initialName?: string;
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
  onSuccess?: (attributes: SearchAttributeDefinition[]) => Promise<void>;
  onCancel?: () => void;
}
