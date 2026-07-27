<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    d="M 2.25,3.75 V 7.5 h 19.5 V 3.75 Z m 19.5,16.5 V 9.75 h -4.5 v 10.5 z m -6.75,0 V 9.75 H 2.25 v 10.5 z M 21.75,1.5 H 24 v 2.25 16.5 2.25 H 21.75 2.25 0 V 20.25 3.75 1.5 h 2.25 z"
    fill="currentcolor"
  />
</Svg>
