export const setValidEnvironmentName = (name: string | undefined): string => {
  const env = name.toLowerCase();
  const validEnvs = ['development', 'test', 'staging'];
  if (name && name.trim().length > 0 && validEnvs.includes(env)) return env;
  return '';
};
