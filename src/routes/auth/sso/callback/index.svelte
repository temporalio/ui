<script context="module" lang="ts">
  import { browser } from '$app/env';
  import { setUser } from '$lib/stores/user';

  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function () {
    if (browser) {
      const accessToken = getMetaContent('access-token');
      const idToken = getMetaContent('id-token');
      const name = getMetaContent('user-name');
      const picture = getMetaContent('user-picture');
      const email = getMetaContent('user-email');

      setUser({
        accessToken,
        idToken,
        name,
        picture,
        email,
      });
    }

    let returnUrl = getMetaContent('return-url');
    if (!returnUrl || returnUrl === '{{.ReturnUrl}}') {
      returnUrl = getMetaContent('public-path');
      if (!returnUrl || returnUrl === '{{.PublicPath}}') {
        returnUrl = '/';
      }
    }

    return {
      status: 302,
      redirect: returnUrl,
    };
  };

  const getMetaContent = (name: string): string => {
    const meta = window.document.getElementsByName(name);
    return meta.length ? meta[0]['content'] : '';
  };
</script>
