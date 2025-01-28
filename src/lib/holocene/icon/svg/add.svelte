<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M13.25 13.25V22H10.75V13.25H2V10.75H10.75V2H13.25V10.75H22V13.25H13.25Z"
    fill="currentcolor"
  />
</Svg>
