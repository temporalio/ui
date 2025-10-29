<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path d="M10 6H8V9H10V6Z" fill="currentColor" />
  <path d="M16 6H14V9H16V6Z" fill="currentColor" />
  <path d="M8 15H6V17H8V15Z" fill="currentColor" />
  <path d="M18 15H16V17H18V15Z" fill="currentColor" />
  <path d="M16 17H8V19H16V17Z" fill="currentColor" />
  <path d="M6 13H4V15H6V13Z" fill="currentColor" />
  <path d="M20 13H18V15H20V13Z" fill="currentColor" />
</Svg>
