<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    d="M 8.25,0.75 V 3 h 3 V 0.75 0 h 1.5 V 0.75 3 h 3 V 0.75 0 h 1.5 V 0.75 3 H 19.5 21 V 4.5 6.75 H 23.25 24 v 1.5 H 23.25 21 v 3 H 23.25 24 v 1.5 H 23.25 21 v 3 H 23.25 24 v 1.5 H 23.25 21 V 19.5 21 H 19.5 17.25 V 23.25 24 h -1.5 V 23.25 21 h -3 V 23.25 24 h -1.5 V 23.25 21 h -3 V 23.25 24 H 6.75 V 23.25 21 H 4.5 3 V 19.5 17.25 H 0.75 0 v -1.5 H 0.75 3 v -3 H 0.75 0 v -1.5 H 0.75 3 v -3 H 0.75 0 V 6.75 H 0.75 3 V 4.5 3 H 4.5 6.75 V 0.75 0 h 1.5 z M 19.5,4.5 h -15 v 15 h 15 z m -3,3 h -9 v 9 h 9 z M 7.5,6 h 9 1.5 v 1.5 9 1.5 H 16.5 7.5 6 V 16.5 7.5 6 Z"
    fill="currentcolor"
  />
</Svg>
