import { browser } from '$app/env';

type UserResponse = {
  AccessToken: string;
  IDToken: string;
  Name: string;
  Email: string;
  Picture: string;
};

const cookieName = 'user';

export const getAuthUserCookie = (isBrowser = browser): User => {
  if (!isBrowser) return {};

  const cookies = document.cookie.split(';');
  let i = 0;
  let next = cookies.find((c) => c.includes(cookieName + i));
  let userBase64 = '';

  while (next) {
    const [_, value] = next.split('=');

    userBase64 += value;
    i++;
    next = cookies.find((c) => c.includes(cookieName + i));
  }

  if (userBase64) {
    try {
      const userS = decodeB64(userBase64);
      const user: UserResponse = JSON.parse(userS);

      return {
        accessToken: user?.AccessToken,
        idToken: user?.IDToken,
        name: user?.Name,
        picture: user?.Picture,
        email: user?.Email,
      };
    } catch (e) {
      console.error(e);
    }
  }

  return {};
};

function decodeB64(str) {
  return decodeURIComponent(atob(str));
}
