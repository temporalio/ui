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

  // `0.1 / 0.001` is `100.00000000000001` in binary floating point; round to
  // nanosecond precision to strip that noise before comparing or displaying.
  const stripFloatNoise = (n: number): number => Math.round(n * 1e9) / 1e9;

  export function getFirstWholeNumberUnit<UnitLabelT extends string>(
    duration: string,
    units: Units<UnitLabelT>,
    defaultUnit: UnitLabelT,
  ): UnitLabelT {
    const secondsValue = Number(parseDuration(duration));

    if (secondsValue === 0) {
      return defaultUnit;
    }

    for (const unit of units) {
      if (Number.isInteger(stripFloatNoise(secondsValue / unit.convert(1)))) {
        return unit.label;
      }
    }

    return defaultUnit;
  }

  // Converts a value entered in a given unit to a seconds duration string
  // (e.g. `60` + `minute(s)` -> `3600s`)
  export function unitValueToDuration<UnitLabelT extends string>(
    rawValue: string | number,
    unitLabel: string,
    units: Units<UnitLabelT>,
  ): string | undefined {
    const unit = units.find((u) => u.label === unitLabel);
    if (!unit) return undefined;

    const raw = String(rawValue ?? '').trim();
    if (raw === '' || isNaN(Number(raw))) return '';

    return `${unit.convert(Number(raw))}s`;
  }

  type ExtractLabel<T> = T extends { label: infer K }[] ? K : never;
</script>

<script lang="ts">
  import type {
    ChangeEventHandler,
    HTMLInputAttributes,
  } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import { composeEventHandlers } from '$lib/utilities/event-handlers';

  import Label from '../label.svelte';

  type K = $$Generic<string>;
  type T = $$Generic<Units<K>>;

  interface BaseProps extends Omit<HTMLInputAttributes, 'class'> {
    value: string;
    label: string;
    labelHidden?: boolean;
    afterLabel?: Snippet;
    id: string;
    required?: boolean;
    hintText?: string;
    hintTextAbove?: string;
    error?: boolean;
    class?: ClassNameValue;
    inputClass?: ClassNameValue;
  }

  interface PropsWithoutCustomUnits extends BaseProps {
    units?: never;
    initialUnit?: DefaultUnits;
  }

  interface PropsWithCustomUnits extends BaseProps {
    units: T;
    initialUnit: ExtractLabel<T>;
  }

  type Props = PropsWithoutCustomUnits | PropsWithCustomUnits;

  let {
    label,
    labelHidden = false,
    afterLabel,
    id,
    hintText,
    hintTextAbove,
    error = false,
    units = DEFAULT_UNITS as T,
    initialUnit = 'second(s)' as ExtractLabel<T>,
    required = false,
    value = $bindable(),
    class: className = '',
    inputClass = '',
    ...inputProps
  }: Props = $props();

  const toUnitValue = (durationValue: string, unitLabel: string): string => {
    if (!durationValue) return '';
    const seconds = Number(parseDuration(durationValue));
    if (!Number.isFinite(seconds)) return '';
    const unitDef = units.find((u) => u.label === unitLabel);
    const factor = unitDef ? unitDef.convert(1) : 1;
    return factor ? String(stripFloatNoise(seconds / factor)) : String(seconds);
  };

  // svelte-ignore state_referenced_locally
  let rawValue = $state(toUnitValue(value, initialUnit));
  // svelte-ignore state_referenced_locally
  let unit = $state(initialUnit);

  const convert = (durationValue: string | number, durationUnit: string) => {
    const result = unitValueToDuration(durationValue, durationUnit, units);
    if (result !== undefined) value = result;
  };

  const handleNumberInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    convert(e.currentTarget.value ?? '', unit);
  };

  const handleUnitChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    convert(rawValue ?? '', e.currentTarget.value);
  };
</script>

<div class={twMerge('flex flex-col gap-1.5', className)}>
  <div class="flex items-center justify-start gap-2">
    <Label class="grow-0" {required} {label} hidden={labelHidden} for={id} />
    {@render afterLabel?.()}
  </div>
  {#if hintTextAbove}
    <p class="text-xs text-secondary">
      {hintTextAbove}
    </p>
  {/if}
  <div
    class={twMerge(
      'surface-primary flex h-10 items-center border border-subtle focus-within:ring-2 focus-within:ring-brand/50',
      inputClass,
      error && 'border-danger focus-within:ring-danger/50',
    )}
  >
    <input
      {id}
      class="flex h-full grow border-r border-subtle bg-transparent p-2 focus-visible:outline-none"
      type="number"
      bind:value={rawValue}
      {...inputProps}
      oninput={composeEventHandlers(handleNumberInput, inputProps.oninput)}
    />
    <select
      id="{id}-unit-select"
      class="surface-secondary h-full pl-2 focus-visible:outline-none"
      bind:value={unit}
      onchange={handleUnitChange}
    >
      {#each units as { label }, i (i)}
        <option value={label}>{label}</option>
      {/each}
    </select>
  </div>
  {#if hintText}
    <p class={twMerge('text-xs text-secondary', error && 'text-danger')}>
      {hintText}
    </p>
  {/if}
</div>
