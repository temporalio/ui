<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import Input from '$lib/holocene/input/input.svelte';
</script>

<Chapter
  description="An input"
  component={Input}
  props={{
    id: 'input1',
    label: 'Hello',
    value: '',
    class: 'w-1/2',
  }}
/>

<Chapter
  description="An invalid Input with hint text and error state"
  component={Input}
  props={{
    class: 'w-1/3',
    id: 'invalid-input',
    valid: false,
    value: 'Bad input',
    hintText: 'This is the hint text',
  }}
/>

<Chapter
  description="An Input with a max length"
  component={Input}
  props={{
    class: 'w-1/3',
    id: 'max-length-input',
    value: '',
    maxLength: 10,
  }}
/>

<Chapter
  description="A dark input"
  component={Input}
  props={{
    id: 'input2',
    placeholder: 'Hello',
    value: '',
    theme: 'dark',
    class: 'w-1/2',
  }}
/>

<Chapter
  description="An input with an icon"
  component={Input}
  props={{
    id: 'input3',
    placeholder: 'Search...',
    value: '',
    icon: 'search',
    class: 'w-1/2',
  }}
/>

<Chapter
  description="A dark input with an icon"
  component={Input}
  props={{
    class: 'w-1/2',
    id: 'input4',
    placeholder: 'Search...',
    icon: 'search',
    value: '',
    theme: 'dark',
  }}
/>

<Chapter
  description="A copyable input"
  component={Input}
  props={{
    class: 'w-96',
    id: 'input5',
    placeholder: 'Copy me',
    value: 'https://www.temporalurl.com/123',
    copyable: true,
  }}
/>

<Chapter
  description="A copyable dark input"
  component={Input}
  props={{
    class: 'w-3/5',
    id: 'input6',
    placeholder: 'Copy me',
    value: 'https://www.temporalurl.com/123',
    theme: 'dark',
    copyable: true,
  }}
/>

<Chapter
  description="A disabled input"
  component={Input}
  props={{
    class: 'w-96',
    id: 'input7',
    value: 'robin@temporal.io',
    disabled: true,
  }}
/>

<Chapter
  description="A disabled dark input"
  component={Input}
  props={{
    class: 'w-96',
    id: 'input8',
    value: 'robin@temporal.io',
    disabled: true,
    theme: 'dark',
  }}
/>
