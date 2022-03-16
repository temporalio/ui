export const getLoginUrl = (
  settings: Settings,
  currentSearchParams: URLSearchParams,
): string => {
  const login = new URL('/auth/sso', settings.baseUrl);
  const opts = settings.auth.options ?? [];

  opts.forEach((option) => {
    const searchParam = currentSearchParams.get(option);
    if (searchParam) {
      login.searchParams.set(option, searchParam);
    }
  });

  return login.toString();
};
