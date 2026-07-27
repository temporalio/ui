<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    d="m 10.5,0 2.25,3 h 9 H 24 V 5.25 18.75 21 H 21.75 2.25 0 V 18.75 2.25 0 h 2.25 z m 2.25,5.25 H 11.625 L 10.95,4.35 9.375,2.25 H 2.25 v 16.5 h 19.5 V 5.25 Z m -4.5,4.5 v 4.5 h -4.5 v -4.5 z m 1.5,0 h 4.5 v 4.5 h -4.5 z m 10.5,0 v 4.5 h -4.5 v -4.5 z"
    fill="currentcolor"
  />
</Svg>
