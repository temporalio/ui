export const validateHttps = (endpoint: string): boolean => {
  return endpoint?.substring(0, 8) === 'https://';
};

export const validateHttp = (endpoint: string): boolean => {
  return endpoint?.substring(0, 7) === 'http://';
};

export const validateHttpOrHttps = (endpoint: string): boolean => {
  return validateHttp(endpoint) || validateHttps(endpoint);
};
