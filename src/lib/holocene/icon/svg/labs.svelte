<script lang="ts">
  import Svg from '../svg.svelte';

  export let active = false;

  $: liquidFill = active ? '#00F37E' : 'currentColor';
</script>

<Svg {...$$props}>
  <path
    d="M14.25 10.0734V2.25H9.75V10.0734V10.7109L9.41719 11.2547L7.11094 15H16.8891L14.5828 11.2547L14.25 10.7109V10.0734ZM16.5 2.25V10.0734L22.5 19.8234V21.75V24H20.25H3.75H1.5V21.75V19.8234L7.5 10.0734V2.25H7.125H6V0H7.125H7.5H9.75H14.25H16.5H16.875H18V2.25H16.875H16.5Z"
    fill="currentColor"
  />
  <path d="M6 17H18L19.5 19.83V22H4.5V19.83L6 17Z" fill={liquidFill} />
</Svg>
