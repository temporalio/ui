<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <polyline
    fill="none"
    stroke="currentcolor"
    stroke-width="1.5"
    stroke-miterlimit="10"
    points="0.000,13.469 4.443,13.469 5.903,10.550 7.842,13.469 9.065,13.469 10.281,15.902 12.470,6.873 13.456,13.353 14.416,17.127 15.149,13.469 18.551,13.469 20.011,12.493 21.714,13.469 24.000,13.469"
  />
</Svg>
