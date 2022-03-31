<script lang="ts">
  import { page } from '$app/stores';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';

  export let compact: boolean = false;

  let category = $page?.params?.category ?? undefined;

  const allOptions = [
    { label: 'All', option: undefined },
    { label: 'Activity', option: 'activity' },
    { label: 'Child Workflow', option: 'child-workflow' },
    { label: 'Command', option: 'command' },
    { label: 'Signal', option: 'signal' },
    { label: 'Timer', option: 'timer' },
    { label: 'Workflow', option: 'workflow' },
  ];

  const compactOptions = [
    { label: 'All', option: undefined },
    { label: 'Activity', option: 'activity' },
    { label: 'Signal', option: 'signal' },
    { label: 'Timer', option: 'timer' },
  ];

  let options = compact ? compactOptions : allOptions;
</script>

<DropdownMenu parameter="category" value={category} {options} />
