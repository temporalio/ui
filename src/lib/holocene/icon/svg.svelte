<script lang="ts">
  export let title = '';
</script>

<svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={$$props.class}
  role="img"
  aria-hidden={!title}
>
  <title>{title}</title>
  <slot />
</svg>
