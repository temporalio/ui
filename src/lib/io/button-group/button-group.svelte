<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { RoundnessGroup, type RoundnessGroupProps } from '../roundness-group';
  import { type ButtonGroupContext, setButtonGroupContext } from './context';

  interface ButtonGroupProps
    extends Partial<RoundnessGroupProps>, ButtonGroupContext {}

  const {
    colorScheme,
    size,
    roundness = 'base',
    innerBorderHandling = 'collapse',
    class: className,
    ...roundnessGroupProps
  }: ButtonGroupProps = $props();

  setButtonGroupContext({
    get colorScheme() {
      return colorScheme;
    },
    get size() {
      return size;
    },
  });
</script>

<RoundnessGroup
  role="group"
  {...roundnessGroupProps}
  {roundness}
  {innerBorderHandling}
  class={twMerge(
    'inline-flex',
    '[&>*:not(:first-child)]:border-l-[color:var(--button-divider)]',
    className,
  )}
/>
