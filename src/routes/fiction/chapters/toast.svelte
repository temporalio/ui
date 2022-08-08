<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Toaster, { toaster } from '$lib/holocene/toaster.svelte';
  import Button from '$lib/holocene/button.svelte';
</script>

<Toaster pop={toaster.pop} toasts={toaster.toasts} />
<Chapter description="An Information Toast">
  <Button
    on:click={() =>
      toaster.push({ variant: 'info', message: 'This is some information' })}
    >Information Toast</Button
  >
</Chapter>
<Chapter description="A Success Toast">
  <Button
    on:click={() =>
      toaster.push({
        variant: 'success',
        message: 'This is a success message',
      })}>Success Toast</Button
  >
</Chapter>
<Chapter description="A Warning Toast">
  <Button
    on:click={() =>
      toaster.push({
        variant: 'warning',
        message: 'This is a warning message',
      })}>Warning Toast</Button
  >
</Chapter>
<Chapter description="An Error Toast">
  <Button
    on:click={() =>
      toaster.push({ variant: 'error', message: 'This is an error message' })}
    >Error Toast</Button
  >
</Chapter>
<Chapter description="A Primary Toast">
  <Button
    on:click={() =>
      toaster.push({ variant: 'primary', message: 'This is a primary toast' })}
    >Primary Toast</Button
  >
</Chapter>
<Chapter description="A Long Toast">
  <Button
    on:click={() =>
      toaster.push({
        variant: 'info',
        message:
          "This is a very long message for a toast. It probably shouldn't be this long.",
        duration: 5000,
      })}>Long Toast</Button
  >
</Chapter>
