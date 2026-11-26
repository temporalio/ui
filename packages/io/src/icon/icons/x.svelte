<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M12.6.75h2.454l-5.36 6.126L16 15.213h-4.937l-3.87-5.055-4.422 5.055H.313L6.046 8.66 0 .75h5.062l3.494 4.62zm-.862 12.996h1.359L4.322 2.141h-1.46z"
  />
</IconSvgWrapper>
