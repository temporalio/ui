<script lang="ts" module>
  export type Unit<K extends string> = {
    label: K;
    convert: (n: number) => number;
  };

  export type Units<T extends string> = Unit<T>[];

  export const MILLISECONDS: Unit<'millisecond(s)'> = {
    label: 'millisecond(s)',
    convert: (n) => n / 1000,
  };

  export const SECONDS: Unit<'second(s)'> = {
    label: 'second(s)',
    convert: (n) => n,
  };

  export const MINUTES: Unit<'minute(s)'> = {
    label: 'minute(s)',
    convert: (n) => n * 60,
  };

  export const HOURS: Unit<'hour(s)'> = {
    label: 'hour(s)',
    convert: (n) => n * 60 * 60,
  };

  export type DefaultUnits =
    | 'millisecond(s)'
    | 'second(s)'
    | 'minute(s)'
    | 'hour(s)';

  export const DEFAULT_UNITS: Units<DefaultUnits> = [
    MILLISECONDS,
    SECONDS,
    MINUTES,
    HOURS,
  ];

  export const parseDuration = (duration: string): string => {
    return duration.split('s')[0] ?? '';
  };

  type ExtractLabel<T> = T extends { label: infer K }[] ? K : never;
</script>

<script lang="ts">
  import type { ChangeEventHandler } from 'svelte/elements';

  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import Label from '../label.svelte';

  type K = $$Generic<string>;
  type T = $$Generic<Units<K>>;

  interface BaseProps {
    value: string;
    label: string;
    id: string;
    required?: boolean;
    hintText?: string;
    class?: ClassNameValue;
  }

  interface PropsWithoutCustomUnits extends BaseProps {
    units?: never;
    initialUnit?: never;
  }

  interface PropsWithCustomUnits extends BaseProps {
    units: T;
    initialUnit: ExtractLabel<T>;
  }

  type Props = PropsWithoutCustomUnits | PropsWithCustomUnits;

  let {
    label,
    id,
    hintText,
    units = DEFAULT_UNITS as T,
    initialUnit = 'second(s)' as ExtractLabel<T>,
    required = false,
    value = $bindable(),
    class: className = '',
  }: Props = $props();

  let rawValue = $state(parseDuration(value));
  let unit = $state(initialUnit);

  const convert = (durationValue: string, durationUnit: string) => {
    const unit = units.find((u) => u.label === durationUnit);

    if (unit) {
      value = `${unit.convert(Number(durationValue))}s`;
    }
  };

  const handleNumberInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    convert(e.currentTarget.value, unit);
  };

  const handleUnitChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    convert(rawValue, e.currentTarget.value);
  };
</script>

<div class={twMerge('flex flex-col gap-1', className)}>
  <Label {required} {label} for={id} />
  <div
    class="flex h-10 items-center border border-subtle focus-within:ring-2 focus-within:ring-brand/50"
  >
    <input
      {id}
      class="flex h-full grow border-r border-subtle p-2 focus-visible:outline-none"
      type="number"
      bind:value={rawValue}
      oninput={handleNumberInput}
    />
    <select
      id="{id}-unit-select"
      class="surface-secondary h-full pl-2 focus-visible:outline-none"
      bind:value={unit}
      onchange={handleUnitChange}
    >
      {#each units as unit}
        <option value={unit.label}>{unit.label}</option>
      {/each}
    </select>
  </div>
  {#if hintText}
    <p class="text-xs text-secondary">{hintText}</p>
  {/if}
</div>
