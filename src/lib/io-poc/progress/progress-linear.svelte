<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    ProgressColorScheme,
    ProgressLinearSize,
    ProgressValueDetails,
  } from './recipe';

  export interface ProgressLinearProps extends Omit<
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
    size?: ProgressLinearSize;
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
    progressHeaderRecipe,
    progressLabelRecipe,
    progressLinearRecipe,
    progressRangeRecipe,
    progressTrackRecipe,
    progressValueTextRecipe,
  } from './recipe';

  import '../shared/animations.css';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    value = 0,
    min = 0,
    max = 100,
    showValue = true,
    formatValue = defaultProgressFormat,
    size = 'md',
    colorScheme = 'brand',
    id = generatedId,
    class: className,
    ...rest
  }: ProgressLinearProps = $props();

  const labelId = $derived(`${id}-label`);
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
  class={progressLinearRecipe(className)}
>
  <div class={progressHeaderRecipe(labelHidden && !showValue)}>
    <ArkProgress.Label class={progressLabelRecipe(labelHidden)}
      >{label}</ArkProgress.Label
    >
    {#if showValue && !indeterminate}
      <ArkProgress.ValueText class={progressValueTextRecipe()}
        >{valueText}</ArkProgress.ValueText
      >
    {/if}
  </div>
  <ArkProgress.Track
    aria-labelledby={labelId}
    aria-label={undefined}
    aria-valuetext={valueText || undefined}
    aria-busy={indeterminate || undefined}
    class={progressTrackRecipe(size)}
  >
    <ArkProgress.Range class={progressRangeRecipe(colorScheme)} />
  </ArkProgress.Track>
</ArkProgress.Root>
