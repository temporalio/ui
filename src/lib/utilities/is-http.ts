export const validateHttps = (endpoint: string): boolean => {
  if (/(https):\/\//i.test(endpoint)) {
    return true;
  }
  return false;
}

export const validateHttpOrHttps = (endpoint: string): boolean => {
  if (/(http(s)?):\/\//i.test(endpoint)) {
    return true;
  }
  return false;
}
