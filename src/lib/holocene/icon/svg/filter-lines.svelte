<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <line
    x1="3"
    y1="6"
    x2="21"
    y2="6"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  />
  <line
    x1="6"
    y1="12"
    x2="18"
    y2="12"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  />
  <line
    x1="9"
    y1="18"
    x2="15"
    y2="18"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  />
</Svg>
