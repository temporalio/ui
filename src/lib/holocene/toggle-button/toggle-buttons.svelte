<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  setContext<boolean>('group', true);
</script>

<div class="flex">
  {@render children?.()}
</div>
