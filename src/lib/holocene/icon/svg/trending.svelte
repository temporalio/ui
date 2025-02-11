<script lang="ts">
  import Svg from '../svg.svelte';
</script>

<Svg {...$$props}>
  <path
    d="M 2,18 L 11,10 L 16,15 L 23,5"
    stroke="currentColor"
    stroke-width="2"
  />
  <line
    x1="18"
    y1="5.5"
    x2="24.5"
    y2="5.5"
    stroke="currentColor"
    stroke-width="2"
  />
  <line
    x1="23.5"
    y1="5"
    x2="23.5"
    y2="11"
    stroke="currentColor"
    stroke-width="2"
  />
</Svg>
