<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { RoundnessGroup, type RoundnessGroupProps } from '../roundness-group';
  import { type ButtonContext, setButtonContext } from './context';

  interface ButtonGroupProps
    extends Partial<RoundnessGroupProps>, ButtonContext {}

  const {
    colorScheme,
    size,
    class: className,
    ...roundnessGroupProps
  }: ButtonGroupProps = $props();

  setButtonContext({
    get colorScheme() {
      return colorScheme;
    },
    get size() {
      return size;
    },
  });
</script>

<RoundnessGroup
  roundness="base"
  innerBorderHandling="collapse"
  class={twMerge(
    'inline-flex',
    '[&>*:not(:first-child)]:border-l-[color:var(--button-divider)]',
    className,
  )}
  {...roundnessGroupProps}
/>
