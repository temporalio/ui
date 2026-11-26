<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="m2.211 1.667 3.92.784-.262 1.307-2.747-.55L1.576 8h12.848l-1.546-4.79-2.747.55-.262-1.308 3.92-.784L16 8.564v5.77H9.01l-.764-3h-.492l-.764 3H0v-5.77zm7.2 8.843.635 2.49h4.62V9.333H9.143zM6.859 9.333H1.333V13h4.621l.634-2.49z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
