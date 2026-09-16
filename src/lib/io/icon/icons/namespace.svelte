<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m8 0 .266.102 7.25 2.818.484.19v9.496l-.463.195-7.25 3.074L8 16l-.287-.122-7.25-3.073-.463-.2V3.11l.484-.189L7.734.102zM1.5 11.581l5.75 2.437V7.496L1.5 5.18zm7.25 2.437 5.75-2.437v-6.4L8.75 7.496zM8 1.646l-5.687 2.21L8 6.143l5.688-2.289z"
  />
</IconSvgWrapper>
