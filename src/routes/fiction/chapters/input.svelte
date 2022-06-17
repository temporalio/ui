<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import Input from '$lib/holocene/input.svelte';
</script>

<Chapter
  description="An input"
  component={Input}
  props={{ id: 'input1', label: 'Hello', value: '' }}
/>

<Chapter
  description="An input with an icon"
  component={Input}
  props={{ id: 'input2', label: 'Search...', value: '', icon: 'search' }}
/>

<Chapter
  description="A copyable input"
  component={Input}
  props={{
    id: 'input2',
    label: 'Search...',
    value: 'Copy me!',
    copyable: true,
  }}
/>
