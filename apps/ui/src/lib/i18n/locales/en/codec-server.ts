export const Namespace = 'codec-server';

export const Strings = {
  title: 'Codec Server',
  description: 'Decode your data remotely through endpoints.',
  'info-message':
    'Users can use this Namespace-level codec server endpoint or override it in their browser with another endpoint.',
  'endpoint-description-prefix': 'Enter a ',
  'endpoint-link-text': 'Codec Server endpoint',
  'endpoint-description-suffix':
    ' to decode payloads for users interacting with this Namespace',
  'endpoint-label': 'Codec Server Endpoint',
  'endpoint-placeholder': 'https://your-codec-server.com/api/v1',
  'pass-access-token-label': 'Pass User Access Token',
  'pass-access-token-description':
    "Include the user's access token with requests to the codec server",
  'cross-origin-credentials-label': 'Include Cross-Origin Credentials',
  'cross-origin-credentials-description':
    'Include credentials when making cross-origin requests to the codec server',
  'custom-section-description':
    'Optionally customize the error message and provide a redirect link for users when the Codec Server fails.',
  'add-custom-button': 'Add Custom Message and Link',
  'custom-message-label': 'Custom Error Message',
  'custom-message-placeholder': 'Enter custom error message...',
  'custom-link-label': 'Custom Error Link',
  'custom-link-placeholder': 'https://your-help-docs.com/codec-errors',
  'custom-link-description':
    'Only include trusted links. This URL will be visible to end users and should point to a secure destination in case of Codec Server failure.',
  'remove-custom-button': 'Remove Custom Message and Link',
  'validation-error-title': 'Validation Error',
  'validation-endpoint-required': 'Endpoint is required',
  'validation-endpoint-url': 'Please enter a valid URL',
  'validation-custom-link-url': 'Please enter a valid URL',
  'save-button': 'Save',
  'saving-button': 'Saving...',
  'cancel-button': 'Cancel',
  'save-success': 'Codec server configuration saved successfully',
  'load-error-title': 'Failed to load codec server settings',
};
