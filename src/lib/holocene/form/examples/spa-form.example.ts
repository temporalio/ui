import { z } from 'zod';

import type { SPAFormConfig } from '../types';

// Basic SPA form example
export const basicSPAForm: SPAFormConfig = {
  type: 'spa',
  schema: z.object({
    email: z.string().email('Please enter a valid email address'),
    name: z.string().min(1, 'Name is required'),
  }),
  defaultValues: {
    email: '',
    name: '',
  },
  onUpdate: async ({ form }) => {
    // Handle SPA form submission
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.data),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return response.json();
  },
  onError: async ({ message }) => {
    console.error('Form submission error:', message);
    // Additional error handling logic
  },
};

// Advanced SPA form with custom options
export const advancedSPAForm: SPAFormConfig = {
  type: 'spa',
  schema: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    age: z.number().min(18).max(120),
    preferences: z.object({
      newsletter: z.boolean(),
      notifications: z.boolean(),
    }),
  }),
  defaultValues: {
    email: '',
    name: '',
    age: 18,
    preferences: {
      newsletter: false,
      notifications: true,
    },
  },
  onUpdate: async ({ form, cancel }) => {
    // Validate business logic
    const data = form.data as Record<string, unknown> & {
      age: number;
      preferences: { newsletter: boolean };
    };
    if (data.age < 21 && data.preferences?.newsletter) {
      cancel(); // Cancel submission
      throw new Error('Newsletter signup requires age 21+');
    }

    // Submit to API
    const response = await fetch('/api/users/advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.data),
    });

    return response.json();
  },
  onError: async ({ result, message }) => {
    // Custom error handling based on error type
    if (result.error?.code === 'VALIDATION_ERROR') {
      console.warn('Validation failed:', message);
    } else {
      console.error('Unexpected error:', message);
    }
  },
  options: {
    resetForm: false,
    dataType: 'json',
    invalidateAll: true,
  },
};

// SPA form with formData (useful for file uploads)
export const fileUploadSPAForm: SPAFormConfig = {
  type: 'spa',
  schema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    file: z.instanceof(File).optional(),
  }),
  defaultValues: {
    title: '',
    description: '',
  },
  onUpdate: async ({ form }) => {
    // Create FormData for file upload
    const formData = new FormData();
    Object.entries(form.data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string | File);
      }
    });

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData, // No Content-Type header - browser sets it automatically
    });

    return response.json();
  },
  options: {
    dataType: 'form', // Important for file uploads
    resetForm: true,
  },
};
