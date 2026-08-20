<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M5.208 16H0v-5.208h5.208zm8.188-5.208a2.604 2.604 0 1 1 0 5.208 2.604 2.604 0 0 1 0-5.208M1.455 14.545h2.299v-2.299h-2.3zm11.94-2.299a1.15 1.15 0 1 0 .001 2.3 1.15 1.15 0 0 0 0-2.3m-3.048 1.877H5.654V12.67h4.693zM3.33 10.347H1.877V5.654H3.33zm10.794 0H12.67l.001-4.693h1.455zM2.605 0a2.605 2.605 0 1 1-.002 5.21A2.605 2.605 0 0 1 2.604 0M16 5.208h-5.208V0H16zM2.604 1.455a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3m9.642 2.299h2.3v-2.3h-2.3zm-1.9-.423H5.653l.001-1.454h4.693z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
