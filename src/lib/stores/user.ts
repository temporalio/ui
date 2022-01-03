import { writable } from 'svelte/store';

import { fetchUser } from '$lib/services/user-service';

export const user = writable<User>(null);

const loadUser = async (): Promise<void> => {
  const userRes = await fetchUser();
  user.set(userRes);
};

loadUser();
