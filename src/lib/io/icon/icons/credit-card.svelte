<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.667 2.167v1.5H1.333v-1.5zm0 4.5v6.5H1.333v-6.5zm-13.334-6H0v14h16v-14zm4 9.5H2.667v1.5h2.666zm5.334 0H6.222v1.5h4.445z"
  />
</IconSvgWrapper>
