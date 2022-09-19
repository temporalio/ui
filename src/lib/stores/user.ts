import { get } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const user = persistStore<User>('user', {});

export const getUser = (): User => get(user);

export const setUser = (u: User) => {
  const { accessToken } = u;
  let { idToken, name, email, picture } = u;

  if (!accessToken || accessToken == '{{.AccessToken}}') {
    throw new Error('No access token');
  }

  if (!idToken || idToken === '{{.IDToken}}') {
    idToken = '';
  }

  if (name === '{{.UserName}}') {
    name = '';
  }

  if (email === '{{.UserEmail}}') {
    email = '';
  }

  if (picture === '{{.UserPicture}}') {
    picture = '';
  }

  user.set({
    accessToken,
    idToken,
    name,
    email,
    picture,
  });
};

export const clearUser = () => {
  user.set({});
};
