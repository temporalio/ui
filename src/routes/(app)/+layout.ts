import { redirect } from '@sveltejs/kit';

import type { LayoutData, LayoutLoad } from './$types';

import { clearAuthUser, getAuthUser, setAuthUser } from '$lib/stores/auth-user';
import {
  cleanAuthUserCookie,
  getAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import { isAuthorized } from '$lib/utilities/is-authorized';
import { routeForLoginPage } from '$lib/utilities/route-for';

import '../../app.css';

export const load: LayoutLoad = async function ({ data }): Promise<LayoutData> {
  if (!data.settings.auth.enabled) {
    cleanAuthUserCookie();
    clearAuthUser();
  }

  const authUser = getAuthUserCookie();
  if (authUser?.accessToken) {
    setAuthUser(authUser);
    cleanAuthUserCookie();
  }

  const user = getAuthUser();

  if (!isAuthorized(data.settings, user)) {
    redirect(302, routeForLoginPage());
  }

  return {
    ...data,
    user,
  };
};
