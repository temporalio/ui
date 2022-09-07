<script>export let href;
export let active = false;
</script>

<a
  {href}
  class:text-blue-900={active}
  {...$$props}
  class="{$$props.class} underline underline-offset-2 hover:text-blue-700"
  on:click|stopPropagation
>
  <slot />
</a>
