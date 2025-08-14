<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <polygon points="6,0 24,12 6,24" fill="currentcolor" />
</Svg>
