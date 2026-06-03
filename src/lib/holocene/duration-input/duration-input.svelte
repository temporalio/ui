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
  import type {
    ChangeEventHandler,
    FocusEventHandler,
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
    afterLabel?: Snippet;
    id: string;
    required?: boolean;
    hintText?: string;
    error?: boolean;
    class?: ClassNameValue;
    emptyValue?: string;
  }

  interface PropsWithoutCustomUnits extends BaseProps {
    units?: never;
    initialUnit?: DefaultUnits;
    emptyUnit?: DefaultUnits;
  }

  interface PropsWithCustomUnits extends BaseProps {
    units: T;
    initialUnit: ExtractLabel<T>;
    emptyUnit?: ExtractLabel<T>;
  }

  type Props = PropsWithoutCustomUnits | PropsWithCustomUnits;

  let {
    label,
    afterLabel,
    id,
    hintText,
    error = false,
    units = DEFAULT_UNITS as T,
    initialUnit = 'second(s)' as ExtractLabel<T>,
    required = false,
    value = $bindable(),
    class: className = '',
    emptyValue,
    emptyUnit,
    ...inputProps
  }: Props = $props();

  const toUnitValue = (durationValue: string, unitLabel: string): string => {
    if (!durationValue) return '';
    const seconds = Number(parseDuration(durationValue));
    if (!Number.isFinite(seconds)) return '';
    const unitDef = units.find((u) => u.label === unitLabel);
    const factor = unitDef ? unitDef.convert(1) : 1;
    return factor ? String(seconds / factor) : String(seconds);
  };

  // svelte-ignore state_referenced_locally
  let rawValue = $state(toUnitValue(value, initialUnit));
  // svelte-ignore state_referenced_locally
  let unit = $state(initialUnit);

  const convert = (durationValue: string, durationUnit: string) => {
    const unit = units.find((u) => u.label === durationUnit);
    if (!unit) return;

    if (durationValue == null && emptyValue !== undefined) {
      value = emptyValue;
      return;
    }

    value = `${unit.convert(Number(durationValue))}s`;
  };

  const handleNumberInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    convert(e.currentTarget.value, unit);
  };

  const handleNumberBlur: FocusEventHandler<HTMLInputElement> = () => {
    if (rawValue == null && emptyValue !== undefined) {
      const newUnit = emptyUnit || unit;
      unit = newUnit;
      rawValue = toUnitValue(emptyValue, newUnit);
      convert(rawValue, newUnit);
    }
  };

  const handleUnitChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    convert(rawValue, e.currentTarget.value);
  };
</script>

<div class={twMerge('flex flex-col gap-1.5', className)}>
  <div class="flex items-center justify-start gap-2">
    <Label class="grow-0" {required} {label} for={id} />
    {@render afterLabel?.()}
  </div>
  <div
    class={twMerge(
      'surface-primary flex h-10 items-center border border-subtle focus-within:ring-2 focus-within:ring-brand/50',
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
      onblur={composeEventHandlers(handleNumberBlur, inputProps.onblur)}
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
    <p class={twMerge('text-xs text-secondary', error && 'text-danger')}>
      {hintText}
    </p>
  {/if}
</div>
