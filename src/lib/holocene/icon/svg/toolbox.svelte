<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    d="M 6,1.5 H 7.125 16.875 18 V 2.625 6 h 2.25 L 24,9.75 v 4.125 2.25 4.125 2.25 H 21.75 2.25 0 V 20.25 16.125 13.875 9.75 L 3.75,6 H 6 V 2.625 Z M 2.25,16.125 v 4.125 h 19.5 v -4.125 h -4.5 V 16.875 18 H 15 v -1.125 -0.75 H 9 V 16.875 18 H 6.75 v -1.125 -0.75 z m 19.5,-2.25 V 10.68285 L 19.31715,8.25 H 4.68282 L 2.25,10.68285 V 13.875 h 4.5 V 13.125 12 H 9 v 1.125 0.75 h 6 V 13.125 12 h 2.25 v 1.125 0.75 z M 15.75,3.75 H 8.25 V 6 h 7.5 z"
    fill="currentcolor"
  />
</Svg>
