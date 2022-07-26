<script lang="ts">
  import Card from '$holocene/card.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="A default Card">
  <Card title="Card title">
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Chapter>

<Chapter description="A warning Card">
  <Card variant="warning" title="Card title">
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Chapter>

<Chapter description="An error Card">
  <Card variant="error" title="Card title">
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Chapter>

<Chapter description="An info Card">
  <Card icon="info" variant="info" title="Card title">
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Chapter>

<Chapter description="A success Card">
  <Card variant="success" title="Card title">
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Chapter>
