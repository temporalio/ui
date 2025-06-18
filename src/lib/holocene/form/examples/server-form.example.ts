import type { SuperValidated } from 'sveltekit-superforms';

import type { ServerFormConfig } from '../types';

// Basic server form example - used in Svelte component
export function createBasicServerForm(
  formData: SuperValidated<Record<string, unknown>>,
): ServerFormConfig {
  return {
    type: 'server',
    data: formData, // SuperValidated data from load function
    onError: async ({ message }) => {
      console.error('Server validation error:', message);
      // Additional client-side error handling
    },
  };
}

// Advanced server form with custom options
export function createAdvancedServerForm(
  formData: SuperValidated<Record<string, unknown>>,
): ServerFormConfig {
  return {
    type: 'server',
    data: formData,
    onError: async ({ result, message }) => {
      // Handle different types of server errors
      if (result.status === 400) {
        console.warn('Validation error:', message);
      } else if (result.status === 500) {
        console.error('Server error:', message);
        // Could trigger retry logic or error reporting
      } else {
        console.error('Unexpected error:', message);
      }
    },
    options: {
      resetForm: true, // Reset form after successful submission
      applyAction: true, // Apply SvelteKit form actions
      invalidateAll: false, // Don't invalidate all load functions
    },
  };
}

// Server form with minimal error handling (uses default)
export function createMinimalServerForm(
  formData: SuperValidated<Record<string, unknown>>,
): ServerFormConfig {
  return {
    type: 'server',
    data: formData,
    // No onError - will use default error handler (toaster notification)
  };
}
