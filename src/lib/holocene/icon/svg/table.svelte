<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    stroke="currentcolor"
    stroke-width="2"
    d="M5.75 19.2502H18.25C18.8023 19.2502 19.25 18.8025 19.25 18.2502V5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H5.75C5.19772 4.75 4.75 5.19772 4.75 5.75V18.2502C4.75 18.8025 5.19772 19.2502 5.75 19.2502Z"
  ></path>
  <path stroke="currentcolor" stroke-width="2" d="M19.25 9.25L5.25 9.25"></path>
  <path stroke="currentcolor" stroke-width="2" d="M19.25 14.75L5.25 14.75"
  ></path>
</Svg>
