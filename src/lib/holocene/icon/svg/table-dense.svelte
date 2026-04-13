<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path stroke="currentcolor" stroke-width="2" d="M2 22H22V2H2V22Z"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 6L2 6"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 10L2 10"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 14L2 14"></path>
  <path stroke="currentcolor" stroke-width="2" d="M22 18L2 18"></path>
</Svg>
