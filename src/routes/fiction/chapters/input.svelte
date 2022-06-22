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
  description="A dark input"
  component={Input}
  props={{ id: 'input2', label: 'Hello', value: '', theme: 'dark' }}
/>

<Chapter
  description="An input with an icon"
  component={Input}
  props={{ id: 'input3', label: 'Search...', value: '', icon: 'search' }}
/>

<Chapter
  description="A dark input with an icon"
  component={Input}
  props={{
    id: 'input4',
    label: 'Search...',
    icon: 'search',
    value: '',
    theme: 'dark',
  }}
/>

<Chapter
  description="A copyable input"
  component={Input}
  props={{
    id: 'input5',
    label: 'Copy me',
    value: 'https://www.temporalurl.com/123',
    copyable: true,
  }}
/>

<Chapter
  description="A copyable dark input"
  component={Input}
  props={{
    id: 'input6',
    label: 'Copy me',
    value: 'https://www.temporalurl.com/123',
    theme: 'dark',
    copyable: true,
  }}
/>
