<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <circle stroke="currentColor" stroke-width="1.5" cx="12" cy="12" r="9" />
  <circle stroke="currentColor" stroke-width="1.5" cx="12" cy="12" r="5" />
  <line
    x1="12"
    x2="12"
    y1="0"
    y2="11"
    stroke="currentColor"
    stroke-width="1.5"
  />
  <line
    x1="12"
    x2="12"
    y1="13"
    y2="24"
    stroke="currentColor"
    stroke-width="1.5"
  />
  <line
    x1="0"
    x2="11"
    y1="12"
    y2="12"
    stroke="currentColor"
    stroke-width="1.5"
  />
  <line
    x1="13"
    x2="24"
    y1="12"
    y2="12"
    stroke="currentColor"
    stroke-width="1.5"
  />
</Svg>
