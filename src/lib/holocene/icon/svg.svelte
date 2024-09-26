<script lang="ts">
  export let title = '';

  export let width = 16;
  export let height = 16;
</script>

<svg
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={$$props.class}
  role="img"
  aria-hidden={!title}
  {...$$restProps}
>
  <title>{title}</title>
  <slot />
</svg>
