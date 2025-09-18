export const Namespace = 'search-attributes' as const;

export const Strings = {
  // Component headers and labels
  'column-attribute': 'Attribute',
  'column-type': 'Type',
  'attribute-label': 'Attribute {{index}}',
  'type-label': 'Type for Attribute {{index}}',
  'select-type-placeholder': 'Select type',
  'custom-search-attributes': 'Custom Search Attributes',

  // Buttons
  'add-attribute-button': 'Add New Custom Search Attribute',
  'save-button': 'Save',
  'saving-button': 'Saving...',
  'cancel-button': 'Cancel',

  // Messages
  'validation-error-title': 'Validation Error',
  'save-success': 'Search attributes saved successfully',
  'save-error': 'Failed to save search attributes',
  'save-error-generic': 'An error occurred while saving search attributes',
  'load-error-title': 'Failed to Load Search Attributes',
  'error-title': 'Error',

  // Validation messages
  'validation-name-required': 'Attribute name is required',
  'validation-names-unique': 'Attribute names must be unique',

  // Development messages
  'crud-not-implemented':
    'CRUD operations will be implemented when SDK team adds endpoints',

  // Type labels
  'type-keyword': 'Keyword',
  'type-text': 'Text',
  'type-int': 'Int',
  'type-double': 'Double',
  'type-bool': 'Bool',
  'type-datetime': 'DateTime',
  'type-keywordlist': 'KeywordList',

  // Story titles
  'story-title': 'Custom Search Attributes for {{namespace}}',
} as const;
