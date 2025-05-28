<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props {
    title: string;
    successTitle: string;
    copied: boolean;
  }

  const { title, successTitle, copied }: Props = $props();
</script>

<Icon
  title={copied ? successTitle : title}
  name={copied ? 'checkmark' : 'copy'}
/>
