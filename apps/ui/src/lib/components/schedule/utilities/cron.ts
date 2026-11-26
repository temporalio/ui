import cronstrue from 'cronstrue';

export function isValidCronString(cronString: string): boolean {
  // The server treats everything after the first '#' as a comment, so an
  // expression containing '#' (e.g. Quartz nth-weekday syntax) would be
  // silently truncated even though cronstrue can parse it.
  if (cronString.includes('#')) {
    return false;
  }

  try {
    cronstrue.toString(cronString, { throwExceptionOnParseError: true });
    return true;
  } catch {
    return false;
  }
}
