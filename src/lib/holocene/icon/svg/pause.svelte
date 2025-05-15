<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <rect x="6" y="0" width="4" height="24" fill="currentcolor" />
  <rect x="14" y="0" width="4" height="24" fill="currentcolor" />
</Svg>
