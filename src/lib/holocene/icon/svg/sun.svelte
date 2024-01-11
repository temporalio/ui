<script lang="ts">
  import Svg from './svg.svelte';
</script>

<Svg {...$$props}>
  <circle cx="12" cy="12" r="6" stroke="currentcolor" />
  <path stroke-linecap="round" stroke="currentcolor" d="M 12,1 V 4" />
  <path stroke-linecap="round" stroke="currentcolor" d="m 12,20 v 3" />
  <path stroke-linecap="round" stroke="currentcolor" d="M 4,12 H 1" />
  <path stroke-linecap="round" stroke="currentcolor" d="m 17.5,6.5 2.5,-2.5" />
  <path stroke-linecap="round" stroke="currentcolor" d="m 4,20 2.5,-2.5" />
  <path
    stroke-linecap="round"
    stroke="currentcolor"
    d="M 17.5,17.5 20,20"
    id="path10"
  />
  <path stroke-linecap="round" stroke="currentcolor" d="M 4,4 6.5,6.5" />
  <path stroke-linecap="round" stroke="currentcolor" d="m 20,12 h 3" />
</Svg>
