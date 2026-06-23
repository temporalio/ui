<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path stroke="currentcolor" stroke-width="2" d="M2 22H22V2H2V22Z"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 8.75L2 8.75"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 15.25L2 15.25"></path>
</Svg>
