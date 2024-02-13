<script lang="ts">
  import Svg from '../svg.svelte';

  export let animate = false;
  export let duration = 2000;
</script>

<Svg {...$$restProps}>
  <path
    d="M12 3L21 8L12 13L3 8L12 3Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M3 12L12 17L21 12"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    class:animate-pulse={animate}
    style="animation-duration: {duration}ms; animation-iteration-count: infinite;"
  />
  <path
    d="M3 16L12 21L21 16"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    class:animate-pulse={animate}
    style="animation-duration: {duration}ms; animation-iteration-count: infinite; animation-direction: reverse;"
  />
</Svg>
