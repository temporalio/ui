<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path d="M 9,2.75 H 6 v 4.5 h 3 z" fill="currentColor" />
  <path d="m 18,2.75 h -3 v 4.5 h 3 z" fill="currentColor" />
  <path d="M 6,16.25 H 3 v 3 h 3 z" fill="currentColor" />
  <path d="m 21,16.25 h -3 v 3 h 3 z" fill="currentColor" />
  <path d="M 18,19.25 H 6 v 3 h 12 z" fill="currentColor" />
  <path d="M 3,13.25 H 0 v 3 h 3 z" fill="currentColor" />
  <path d="m 24,13.25 h -3 v 3 h 3 z" fill="currentColor" />
</Svg>
