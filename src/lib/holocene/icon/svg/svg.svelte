<script lang="ts">
  export let width = 24;
  export let height = 24;
  export let title = '';
</script>

<svg
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={$$props.class}
>
  <title>{title}</title>
  <slot />
</svg>
