<script>
  import { page } from '$app/stores';

  $: ({ href, src, alt, ...inputProps } = $$props);
  $: isActive = href === $page.path;
</script>

<a {href} class:active={isActive}
  ><img class:active={isActive} {src} {alt} /><slot /></a
>

<style>
  a.active {
    background-color: #3730a3;
    color: #fff;
  }

  img.active {
    filter: sepia() saturate(0%) hue-rotate(30deg);
  }

  img {
    margin-bottom: 10px;
  }

  a {
    width: 90px;
    color: #e0e7ff;
    margin-bottom: 18px;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 72px;
    text-decoration: none;
    position: relative;
  }
</style>
