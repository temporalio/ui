<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  export interface TabsContentProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    value: string;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { Tabs as ArkTabs } from '@ark-ui/svelte/tabs';

  import { tabsContentRecipe } from './recipe';

  let {
    value,
    class: className,
    children,
    ...rest
  }: TabsContentProps = $props();
</script>

<ArkTabs.Content {value} class={tabsContentRecipe(className)} {...rest}>
  {@render children?.()}
</ArkTabs.Content>
