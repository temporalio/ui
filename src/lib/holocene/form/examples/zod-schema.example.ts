import type { SuperValidated } from 'sveltekit-superforms';
import { z } from 'zod';

import type { ServerFormConfig, SPAFormConfig } from '../types';

// Complex user registration schema
export const userRegistrationSchema = z
  .object({
    // Basic information
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
      ),

    confirmPassword: z.string(),

    // Personal details
    profile: z.object({
      firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters'),

      lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters'),

      dateOfBirth: z.string().refine((date) => {
        const birth = new Date(date);
        const now = new Date();
        const age = now.getFullYear() - birth.getFullYear();
        return age >= 13;
      }, 'You must be at least 13 years old'),

      phoneNumber: z
        .string()
        .regex(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number')
        .optional(),
    }),

    // Preferences
    preferences: z.object({
      newsletter: z.boolean().default(false),
      notifications: z.object({
        email: z.boolean().default(true),
        sms: z.boolean().default(false),
        push: z.boolean().default(true),
      }),
      theme: z.enum(['light', 'dark', 'auto']).default('auto'),
      language: z.string().min(2).max(5).default('en'),
    }),

    // Terms and conditions
    agreements: z.object({
      terms: z
        .boolean()
        .refine(
          (val) => val === true,
          'You must accept the terms and conditions',
        ),
      privacy: z
        .boolean()
        .refine((val) => val === true, 'You must accept the privacy policy'),
      marketing: z.boolean().optional(),
    }),

    // Optional referral code
    referralCode: z
      .string()
      .regex(
        /^[A-Z0-9]{6,10}$/,
        'Referral code must be 6-10 uppercase letters and numbers',
      )
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Nested data example - Company registration
export const companyRegistrationSchema = z.object({
  company: z.object({
    name: z.string().min(1, 'Company name is required'),
    registrationNumber: z.string().optional(),
    industry: z.enum([
      'technology',
      'finance',
      'healthcare',
      'education',
      'other',
    ]),
    size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),

    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().min(2, 'Country is required'),
    }),

    contacts: z
      .array(
        z.object({
          type: z.enum(['primary', 'billing', 'technical']),
          name: z.string().min(1, 'Contact name is required'),
          email: z.string().email('Invalid email address'),
          phone: z.string().optional(),
        }),
      )
      .min(1, 'At least one contact is required'),
  }),

  billing: z
    .object({
      plan: z.enum(['starter', 'professional', 'enterprise']),
      billingCycle: z.enum(['monthly', 'yearly']),
      paymentMethod: z.enum(['credit_card', 'bank_transfer', 'invoice']),

      // Conditional validation based on payment method
      creditCard: z
        .object({
          number: z
            .string()
            .regex(/^\d{16}$/, 'Credit card number must be 16 digits'),
          expiryMonth: z.number().min(1).max(12),
          expiryYear: z.number().min(new Date().getFullYear()),
          cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
        })
        .optional(),

      bankAccount: z
        .object({
          accountNumber: z.string().min(8, 'Account number is required'),
          routingNumber: z.string().min(9, 'Routing number is required'),
          accountType: z.enum(['checking', 'savings']),
        })
        .optional(),
    })
    .refine(
      (data) => {
        if (data.paymentMethod === 'credit_card') {
          return data.creditCard !== undefined;
        }
        if (data.paymentMethod === 'bank_transfer') {
          return data.bankAccount !== undefined;
        }
        return true;
      },
      {
        message: 'Payment details are required for the selected payment method',
        path: ['paymentMethod'],
      },
    ),
});

// SPA Form with complex validation
export const complexUserRegistrationSPA: SPAFormConfig = {
  type: 'spa',
  schema: userRegistrationSchema,
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneNumber: '',
    },
    preferences: {
      newsletter: false,
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      theme: 'auto',
      language: 'en',
    },
    agreements: {
      terms: false,
      privacy: false,
      marketing: false,
    },
    referralCode: '',
  },
  onUpdate: async ({ form }) => {
    // Additional business logic validation
    const data = form.data as z.infer<typeof userRegistrationSchema>;

    // Check if email is already taken
    const emailCheck = await fetch('/api/users/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });

    if (!emailCheck.ok) {
      throw new Error('Email address is already registered');
    }

    // Submit registration
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },
  onError: async ({ result, message }) => {
    // Handle specific validation errors
    if (result.error?.code === 'VALIDATION_ERROR') {
      console.warn('Form validation failed:', message);
    } else if (result.error?.code === 'EMAIL_EXISTS') {
      console.error('Email already exists:', message);
    } else {
      console.error('Registration error:', message);
    }
  },
  options: {
    resetForm: false,
    dataType: 'json',
    invalidateAll: true,
  },
};

// Server form example factory for complex validation
export function createComplexServerForm(
  formData: SuperValidated<Record<string, unknown>>,
): ServerFormConfig {
  return {
    type: 'server',
    data: formData, // SuperValidated data from load function with the schema
    onError: async ({ result, message }) => {
      // Handle server-side validation errors
      if (result.status === 400) {
        console.warn('Server validation failed:', message);
        // Could show specific field errors
      } else if (result.status === 409) {
        console.error('Conflict error (e.g., email exists):', message);
      } else {
        console.error('Unexpected server error:', message);
      }
    },
    options: {
      resetForm: true,
      applyAction: true,
      invalidateAll: false,
    },
  };
}

// Example of conditional schema validation
export const dynamicFormSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal('individual'),
    personalInfo: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN format: XXX-XX-XXXX'),
    }),
  }),
  z.object({
    userType: z.literal('business'),
    businessInfo: z.object({
      companyName: z.string().min(1),
      ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN format: XX-XXXXXXX'),
      businessType: z.enum([
        'llc',
        'corporation',
        'partnership',
        'sole_proprietorship',
      ]),
    }),
  }),
]);

// Example with file upload validation
export const fileUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum(['document', 'image', 'video', 'other']),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB',
    )
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'].includes(
          file.type,
        ),
      'Only JPEG, PNG, PDF, and TXT files are allowed',
    ),
  isPublic: z.boolean().default(false),
});
