<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from 'svelte-fa';
  import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

  import { goto } from '$app/navigation';

  export let expanded = false;
  export let hash: string;

  onMount(() => {
    expanded = window.location.hash === hash;
  });

  const expand = () => {
    expanded = !expanded;
    if (expanded) {
      goto(hash);
    }
  };
</script>

<article
  id={hash.slice(1)}
  class="w-full py-2 my-4 border-2 rounded-lg relative"
  on:click={expand}
>
  <div class="flex justify-between m-4">
    <div class="flex items-center gap-4 w-full h-full overflow-x-hidden">
      <slot />
    </div>
    <div class="flex justify-center items-center w-16">
      <Icon
        icon={expanded ? faAngleUp : faAngleDown}
        scale={1.2}
        class="block w-full h-full"
      />
    </div>
  </div>
  {#if expanded}<slot name="expanded" />{/if}
</article>

<style lang="postcss">
  article:hover {
    @apply cursor-pointer;
  }
</style>
