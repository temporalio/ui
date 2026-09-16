<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.264 16H.02v-5.206h5.245zM15.832 2.38l-1.06 1.052-.599-.592v12.359H12.68V2.84l-.597.591-1.062-1.051L13.426 0zM1.513 14.507H3.77v-2.218H1.513zm8.866-.363H5.69V12.65h4.69zM3.39 10.38H1.896V5.74H3.39zM2.641.12c1.441 0 2.623 1.16 2.623 2.604S4.082 5.327 2.641 5.327A2.61 2.61 0 0 1 .02 2.724 2.613 2.613 0 0 1 2.641.121m0 1.494a1.12 1.12 0 0 0-1.128 1.11 1.12 1.12 0 0 0 1.128 1.109 1.12 1.12 0 0 0 1.13-1.109 1.12 1.12 0 0 0-1.13-1.11M10.38 3.47H5.69V1.976h4.69z"
  />
</IconSvgWrapper>
