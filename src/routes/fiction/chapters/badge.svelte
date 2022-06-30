<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="A default Badge">
  <Badge>Default</Badge>
</Chapter>

<Chapter description="An alpha Badge">
  <Badge type="alpha">Alpha</Badge>
</Chapter>

<Chapter description="A beta Badge">
  <Badge type="beta">Beta</Badge>
</Chapter>

<Chapter description="A warning Badge">
  <Badge type="warning">Warning</Badge>
</Chapter>

<Chapter description="Count Badges">
  <div class="flex flex-row gap-4">
    <Badge type="count">3</Badge>
    <Badge type="count">30</Badge>
    <Badge type="count">300</Badge>
  </div>
</Chapter>
