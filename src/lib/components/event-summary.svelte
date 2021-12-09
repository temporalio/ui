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
  <div class="absolute right-6 top-7">
    <Icon icon={expanded ? faAngleUp : faAngleDown} scale={1.2} />
  </div>
  <slot />
  {#if expanded}<slot name="expanded" />{/if}
</article>

<style lang="postcss">
  article:hover {
    @apply cursor-pointer;
  }
</style>
