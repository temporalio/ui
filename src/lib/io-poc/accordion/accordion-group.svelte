<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  export type AccordionGroupProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'class'
  > & { class?: string };
</script>

<script lang="ts">
  import { accordionGroupRecipe } from './recipe';

  let { class: className, children, ...rest }: AccordionGroupProps = $props();
</script>

<div class={accordionGroupRecipe(className)} {...rest}>
  {@render children?.()}
</div>
