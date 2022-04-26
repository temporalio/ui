<script lang="ts">
  export let href: string;
  export let active = false;
</script>

<a
  {href}
  class:text-blue-900={active}
  {...$$props}
  class="{$$props.class} hover:text-blue-700 underline underline-offset-2"
  on:click
>
  <slot />
</a>
