<script lang="ts">
  import Icon, {
    Home,
    Photograph,
    Collection,
    DocumentSearch,
    Identification,
    User,
    Clock,
    ArrowNarrowRight,
    CursorClick,
    ViewGrid,
    ViewBoards,
  } from 'svelte-hero-icons';

  export let icon: string;
  export let styles: string;

  function changeIcons(icon) {
    let result: any = null;
    switch (icon) {
      case 'Home':
        result = Home;
        break;
      case 'Photograph':
        result = Photograph;
        break;
      case 'Collection':
        result = Collection;
        break;
      case 'DocumentSearch':
        result = DocumentSearch;
        break;
      case 'Identification':
        result = Identification;
        break;
      case 'User':
        result = User;
        break;
      case 'Clock':
        result = Clock;
        break;
      case 'ArrowNarrowRight':
        result = ArrowNarrowRight;
        break;
      case 'CursorClick':
        result = CursorClick;
        break;
      case 'ViewGrid':
        result = ViewGrid;
        break;
      case 'ViewBoards':
        result = ViewBoards;
        break;
    }

    return result;
  }

  $: src = changeIcons(icon);
</script>

<Icon {src} class={styles} />
