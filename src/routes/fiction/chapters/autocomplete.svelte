<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import Autocomplete from '$lib/holocene/autocomplete.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  const props = {
    id: 'autocomplete',
    label: 'Example',
    value: '',
    icon: 'search' as IconName,
    options: ['Avacado', 'Bacon', 'Cheese', 'Donuts', 'Eggs'],
    onOptionClick: (value: string) => console.log(value),
  };
</script>

<Chapter description="An autocomplete input" component={Autocomplete} {props} />
