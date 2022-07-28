<script lang="ts">
  import Textarea from '$lib/holocene/textarea.svelte';
  import Chapter from '../_chapter.svelte';
  let value =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vitae odio et nunc aliquet accumsan. Maecenas semper tincidunt vehicula. Mauris aliquam vulputate lorem, auctor tempor justo posuere eu. Integer nec urna nec nunc finibus efficitur. Cras quis maximus sem, ut iaculis nibh. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In nec neque vel purus hendrerit laoreet ut sit amet sem. Duis varius dignissim posuere. Nunc odio magna, euismod quis ligula eget, tincidunt ornare tellus. Aenean augue libero, feugiat at nisi eu, ornare pharetra libero. Nulla fermentum ipsum id venenatis pretium. Cras finibus tincidunt imperdiet. Mauris bibendum nibh sed tellus dapibus, et viverra tortor lacinia.';
</script>

<Chapter description="A textarea" component={Textarea} props={{ value }} />

<Chapter
  description="A disabled textarea"
  component={Textarea}
  props={{ disabled: true, value }}
/>

<Chapter
  description="A textarea with an error"
  component={Textarea}
  props={{ value, error: 'There was an error.' }}
/>

<Chapter
  description="A textarea with a placeholder"
  component={Textarea}
  props={{ placeholder: 'Add text here...' }}
/>
