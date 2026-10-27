<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { SliderOrientation } from './recipe';

  export interface SliderMark {
    value: number;
    label?: string;
  }

  export interface SliderProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir' | 'aria-label' | 'aria-labelledby'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    value?: number[];
    min?: number;
    max?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    orientation?: SliderOrientation;
    marks?: SliderMark[];
    showValue?: boolean;
    formatValue?: (value: number) => string;
    thumbLabels?: string[];
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    name?: string;
    onValueChange?: (value: number[]) => void;
    onValueChangeEnd?: (value: number[]) => void;
    class?: string;
  }
</script>

<script lang="ts">
  import { Slider as ArkSlider } from '@ark-ui/svelte/slider';

  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    fieldLabelRecipe,
    fieldRequiredIndicatorRecipe,
  } from '$lib/io-ark/field';

  import {
    sliderControlRecipe,
    sliderHeaderRecipe,
    sliderMarkerGroupRecipe,
    sliderMarkerRecipe,
    sliderRangeRecipe,
    sliderRecipe,
    sliderThumbRecipe,
    sliderTrackRecipe,
    sliderValueTextRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    value = $bindable([0]),
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    orientation = 'horizontal',
    marks = [],
    showValue = true,
    formatValue = (current: number) => String(current),
    thumbLabels = [],
    required = false,
    disabled = false,
    readOnly = false,
    id = generatedId,
    name,
    onValueChange,
    onValueChangeEnd,
    class: className,
    ...rest
  }: SliderProps = $props();

  const helperTextId = $derived(`${id}-helper-text`);
  const errorTextId = $derived(`${id}-error-text`);
  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(isInvalid && !!error);
  const describedBy = $derived(
    [helperText && helperTextId, showError && errorTextId]
      .filter(Boolean)
      .join(' ') || undefined,
  );
  const valueText = $derived(value.map(formatValue).join(' – '));
</script>

<ArkSlider.Root
  {id}
  bind:value
  {min}
  {max}
  {step}
  {minStepsBetweenThumbs}
  {orientation}
  {name}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  thumbAlignment="contain"
  getAriaValueText={(details) => formatValue(details.value)}
  onValueChange={(details) => onValueChange?.(details.value)}
  onValueChangeEnd={(details) => onValueChangeEnd?.(details.value)}
  class={sliderRecipe(className)}
  {...rest}
>
  <div class={sliderHeaderRecipe()}>
    <ArkSlider.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
      {label}
      {#if required}
        <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
      {/if}
    </ArkSlider.Label>
    {#if showValue}
      <ArkSlider.ValueText class={sliderValueTextRecipe()}
        >{valueText}</ArkSlider.ValueText
      >
    {/if}
  </div>
  {#if helperText}
    <p id={helperTextId} class={fieldHelperTextRecipe('-mt-1')}>
      {helperText}
    </p>
  {/if}
  <ArkSlider.Control class={sliderControlRecipe()}>
    <ArkSlider.Track class={sliderTrackRecipe()}>
      <ArkSlider.Range class={sliderRangeRecipe()} />
    </ArkSlider.Track>
    {#each value as _, index (index)}
      <ArkSlider.Thumb
        {index}
        aria-describedby={describedBy}
        {...thumbLabels[index] ? { 'aria-label': thumbLabels[index] } : {}}
        class={sliderThumbRecipe()}
      >
        <ArkSlider.HiddenInput />
      </ArkSlider.Thumb>
    {/each}
  </ArkSlider.Control>
  {#if marks.length}
    <ArkSlider.MarkerGroup class={sliderMarkerGroupRecipe()}>
      {#each marks as mark (mark.value)}
        <ArkSlider.Marker value={mark.value} class={sliderMarkerRecipe()}
          >{mark.label ?? formatValue(mark.value)}</ArkSlider.Marker
        >
      {/each}
    </ArkSlider.MarkerGroup>
  {/if}
  {#if showError}
    <p id={errorTextId} aria-live="polite" class={fieldErrorTextRecipe()}>
      {error}
    </p>
  {/if}
</ArkSlider.Root>
