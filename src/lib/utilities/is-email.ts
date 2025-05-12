import { z } from 'zod';

/**
 * Schema used to validate email addresses.
 *
 * This schema ensures that the provided string is in a valid email format.
 */
export const emailSchema = z.string().email();

/**
 * Determines whether the provided string is a valid email address.
 *
 * This function uses the emailSchema to safely parse the input value.
 *
 * @param value - The string to validate as an email address.
 * @returns True if the email is valid; otherwise, false.
 */
export const isEmail = (value: string): boolean => {
  return emailSchema.safeParse(value).success;
};
