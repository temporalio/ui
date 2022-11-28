<script lang="ts">
  export let href: string;
  export let active = false;
  export let newTab = false;
</script>

{#if newTab}
  <a
    {href}
    target="_blank"
    rel="noreferrer"
    class:text-blue-900={active}
    {...$$props}
    class="{$$props.class} underline underline-offset-2 hover:text-blue-700"
    on:click|stopPropagation
  >
    <slot />
  </a>
{:else}
  <a
    {href}
    class:text-blue-900={active}
    {...$$props}
    class="{$$props.class} underline underline-offset-2 hover:text-blue-700"
    on:click
  >
    <slot />
  </a>
{/if}
