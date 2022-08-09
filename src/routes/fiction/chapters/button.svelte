<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Button from '$holocene/button.svelte';
</script>

<Chapter description="A primary button" component={Button}>Primary</Chapter>

<Chapter
  description="A secondary button"
  component={Button}
  props={{ variant: 'secondary' }}>Secondary</Chapter
>

<Chapter
  description="A dangerous button"
  component={Button}
  props={{ variant: 'destructive' }}>Danger</Chapter
>

<Chapter
  description="A disabled primary button"
  component={Button}
  props={{ disabled: true }}>Disabled Primary</Chapter
>

<Chapter
  description="A disabled secondary button"
  component={Button}
  props={{ disabled: true, variant: 'secondary' }}>Disabled Secondary</Chapter
>

<Chapter
  description="A disabled dangerous button"
  component={Button}
  props={{ disabled: true, variant: 'destructive' }}>Disabled Danger</Chapter
>

<Chapter
  description="A button as an anchor"
  component={Button}
  props={{ href: 'https://temporal.io', as: 'anchor' }}>Link</Chapter
>

<Chapter
  description="A button styled as a link"
  component={Button}
  props={{ variant: 'link' }}>Button</Chapter
>

<Chapter
  description="A button with an Icon"
  component={Button}
  props={{ icon: 'refresh', iconScale: 0.8 }}
>
  Reload
</Chapter>

<Chapter
  description="A button with a Count"
  component={Button}
  props={{ count: 3 }}
>
  Save
</Chapter>

<Chapter description="some buttons next to each other">
  <div class="flex flex-row gap-2">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Danger</Button>
    <Button icon="refresh" variant="secondary">Refresh</Button>
    <Button loading variant="secondary">Loading</Button>
  </div>
</Chapter>
