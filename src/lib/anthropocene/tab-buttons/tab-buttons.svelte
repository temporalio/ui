<script lang="ts">
  import { setContext } from 'svelte';
  setContext<boolean>('group', true);
</script>

<div class="flex">
  <slot />
</div>
