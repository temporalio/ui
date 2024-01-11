import { persistStore } from './persist-store';

export type AppTheme = 'light' | 'dark';

export const theme = persistStore<AppTheme>('appTheme');

export const changeTheme = (newTheme: AppTheme) => {
  theme.set(newTheme);
};
