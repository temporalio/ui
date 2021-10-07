<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let loading = false;
  export let updating = false;
</script>

{#if loading}
  <div transition:slide={{ delay: 250, duration: 500, easing: quintOut }}>
    Loading…
  </div>
{/if}

{#if updating}
  <div transition:slide={{ delay: 250, duration: 500, easing: quintOut }}>
    Updating…
  </div>
{/if}

<style lang="postcss">
  div {
    @apply bg-yellow-200 font-semibold p-2;
  }
</style>
