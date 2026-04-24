/// <reference types="@sveltejs/kit" />

declare module 'date-fns-tz' {
  export function zonedTimeToUtc(date: Date | string, timeZone: string): Date;
  export function utcToZonedTime(date: Date | string, timeZone: string): Date;
  export function format(
    date: Date,
    formatStr: string,
    options?: { timeZone?: string; locale?: Locale },
  ): string;
  export function getTimezoneOffset(timeZone: string, date?: Date): number;
}

declare namespace svelte.JSX {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    'onclick-outside': (e: CustomEvent) => void;
  }
}
