<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    ProgressCircularSize,
    ProgressColorScheme,
    ProgressValueDetails,
  } from './recipe';

  export interface ProgressCircularProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    label: string;
    labelHidden?: boolean;
    value?: number | null;
    min?: number;
    max?: number;
    showValue?: boolean;
    formatValue?: (details: ProgressValueDetails) => string;
    size?: ProgressCircularSize | number;
    thickness?: number;
    colorScheme?: ProgressColorScheme;
    id?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import { Progress as ArkProgress } from '@ark-ui/svelte/progress';

  import {
    defaultProgressFormat,
    getProgressPercent,
    progressCircleRangeRecipe,
    progressCircleRecipe,
    progressCircleTrackRecipe,
    progressCircleValueTextRecipe,
    progressCircularRecipe,
    progressCircularSizes,
    progressLabelRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    value = 0,
    min = 0,
    max = 100,
    showValue = false,
    formatValue = defaultProgressFormat,
    size = 'md',
    thickness,
    colorScheme = 'brand',
    id = generatedId,
    class: className,
    ...rest
  }: ProgressCircularProps = $props();

  const labelId = $derived(`${id}-label`);
  const dimensions = $derived(
    typeof size === 'number'
      ? { size, thickness: Math.max(2, Math.round(size / 12)) }
      : progressCircularSizes[size],
  );
  const strokeWidth = $derived(thickness ?? dimensions.thickness);
  const percent = $derived(getProgressPercent(value, min, max));
  const indeterminate = $derived(value == null);
  const valueText = $derived(
    indeterminate ? '' : formatValue({ value, percent, min, max }),
  );
</script>

<ArkProgress.Root
  {id}
  ids={{ label: labelId }}
  {value}
  {min}
  {max}
  {...rest}
  class={progressCircularRecipe(className)}
>
  <div
    class="relative inline-flex"
    style:--size="{dimensions.size}px"
    style:--thickness="{strokeWidth}px"
  >
    <ArkProgress.Circle
      aria-labelledby={labelId}
      aria-label={undefined}
      aria-valuetext={valueText || undefined}
      aria-busy={indeterminate || undefined}
      class={progressCircleRecipe()}
    >
      <ArkProgress.CircleTrack class={progressCircleTrackRecipe()} />
      <ArkProgress.CircleRange class={progressCircleRangeRecipe(colorScheme)} />
    </ArkProgress.Circle>
    {#if showValue && !indeterminate}
      <ArkProgress.ValueText
        aria-hidden="true"
        class={progressCircleValueTextRecipe(dimensions.size)}
        >{valueText}</ArkProgress.ValueText
      >
    {/if}
  </div>
  <ArkProgress.Label class={progressLabelRecipe(labelHidden)}
    >{label}</ArkProgress.Label
  >
</ArkProgress.Root>
