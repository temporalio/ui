<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import Autocomplete from '$lib/holocene/autocomplete.svelte';

  const props = {
    id: 'autocomplete',
    label: 'Example',
    value: '',
    icon: 'search',
    options: ['Avacado', 'Bacon', 'Cheese', 'Donuts', 'Eggs'],
    onOptionClick: (value: string) => console.log(value),
  };
</script>

<Chapter description="An autocomplete input" component={Autocomplete} {props} />
