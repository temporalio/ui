import cronstrue from 'cronstrue';

export function isValidCronString(cronString: string): boolean {
  try {
    cronstrue.toString(cronString, { throwExceptionOnParseError: true });
    return true;
  } catch {
    return false;
  }
}
