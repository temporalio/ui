import { z, ZodSchema, type ZodTypeDef } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';

import type { DurationString } from '../types';

export const second = () => z.number().int().min(0).max(59).default(0);
export const minute = () => z.number().int().min(0).max(59).default(0);
export const hour = () => z.number().int().min(0).max(23).default(0);

export const month = () => z.number().int().min(1).max(12);
export const year = () => z.number().int();

export const dayOfMonth = () => z.number().int().min(1).max(31);
export const dayOfWeek = () => z.number().int().min(0).max(6);

export const durationString = () =>
  z
    .preprocess(
      (input) => {
        if (typeof input === 'number') {
          return `${input}s`;
        }

        if (typeof input === 'string') {
          return `${Number(parseDuration(input))}s`;
        }

        return input;
      },
      z.string().regex(/^\d+s$/),
    )
    .refine((val): val is DurationString => /^\d+s$/.test(val));

export const jsonString = () =>
  z
    .string()
    .trim()
    .refine((input) => {
      if (!input) {
        return true;
      }

      try {
        JSON.parse(input);
        return true;
      } catch {
        return false;
      }
    }, 'Input must be valid JSON');

export function rangeSchemaOf<T, U extends ZodTypeDef, V>(
  schema: ZodSchema<T, U, V>,
) {
  return z.object({
    start: schema,
    end: schema.optional(),
    step: z.number().int().optional(),
  });
}

export const structuredCalendarSchema = () =>
  z
    .object({
      second: z.array(rangeSchemaOf(second())).default([{ start: 0 }]),
      minute: z.array(rangeSchemaOf(minute())).default([{ start: 0 }]),
      hour: z.array(rangeSchemaOf(hour())).default([{ start: 0 }]),
      dayOfMonth: z
        .array(rangeSchemaOf(dayOfMonth()))
        .default([{ start: 1, end: 31 }]),
      dayOfWeek: z
        .array(rangeSchemaOf(dayOfWeek()))
        .default([{ start: 0, end: 6 }]),
      month: z.array(rangeSchemaOf(month())).default([{ start: 1, end: 12 }]),
      year: z.array(rangeSchemaOf(year())).optional(),
      comment: z.string().default(''),
    })
    .default({});
