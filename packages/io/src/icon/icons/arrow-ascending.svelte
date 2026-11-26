<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M3.126 2.457 3.596 2l.471.457 2.658 2.578.47.456-.94.911-.471-.457L4.26 4.468V14H2.932V4.468L1.409 5.945l-.47.457L0 5.492l.47-.457 2.66-2.578zm5.565-.06h1.993v1.29H8.026v-1.29zm0 3.438h3.765v1.29h-4.43v-1.29zm0 3.438h5.537v1.29H8.026v-1.29zm0 3.438H16V14H8.026v-1.29z"
  />
</IconSvgWrapper>
