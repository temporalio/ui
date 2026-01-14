<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <g transform="translate(-4, -5) scale(1.2)">
    <path
      d="M16.5 7.5L18.75 10.5H27.75H30V12.75V26.25V28.5H27.75H8.25H6V26.25V9.75V7.5H8.25H16.5ZM18.75 12.75H17.625L16.95 11.85L15.375 9.75H8.25V26.25H27.75V12.75H18.75ZM14.25 17.25V21.75H9.75V17.25H14.25ZM15.75 17.25H20.25V21.75H15.75V17.25ZM26.25 17.25V21.75H21.75V17.25H26.25Z"
      fill="currentcolor"
    />
  </g>
</Svg>
