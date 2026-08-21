<script lang="ts">
  import { IconMegaphone, type IconProps } from '$lib/io/icon';

  const props: IconProps = $props();
</script>

<span class="relative inline-flex">
  <IconMegaphone {...props} />
  <span
    class="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-green-600"
  ></span>
</span>
