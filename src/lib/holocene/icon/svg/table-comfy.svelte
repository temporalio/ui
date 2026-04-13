<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    stroke="currentcolor"
    stroke-width="2"
    d="M3 22H21C21.5523 22 22 21.5523 22 21V3C22 2.44772 21.5523 2 21 2H3C2.44772 2 2 2.44772 2 3V21C2 21.5523 2.44772 22 3 22Z"
  ></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 8.75L2 8.75"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 15.25L2 15.25"></path>
</Svg>
