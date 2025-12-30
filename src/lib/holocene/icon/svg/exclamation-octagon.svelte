<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    d="M 2.25,15.56715 V 8.432805 L 8.432805,2.25 H 15.56715 L 21.75,8.432805 V 15.56715 L 15.56715,21.75 H 8.432805 Z M 7.5,0 0,7.5 v 9 L 7.5,24 h 9 L 24,16.5 v -9 L 16.5,0 Z m 5.625,6 h -2.25 v 1.125 5.25 1.125 h 2.25 v -1.125 -5.25 z m -2.25,9 v 2.25 h 2.25 V 15 Z"
    fill="currentColor"
  />
</Svg>
