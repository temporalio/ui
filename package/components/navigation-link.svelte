<script>import { page } from '$app/stores';
import { pathMatches } from '../utilities/path-matches';
export let href;
$: isActive = pathMatches(href, $page.url.pathname);
</script>

<a {href} class:active={isActive} class="relative">
  <slot />
</a>

<style>
  a.active {
    --tw-text-opacity: 1;
    color: rgb(191 219 254 / var(--tw-text-opacity));
    opacity: 1
}

  a.active:after {
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0px;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    --tw-bg-opacity: 1;
    background-color: rgb(191 219 254 / var(--tw-bg-opacity));
    content: '';
    height: 3px
}
  a:hover {
    opacity: 1
}
  a {
    display: block;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 500;
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity))
}</style>
