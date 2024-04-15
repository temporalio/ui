export const isVersionNewer = (
  recommendedVersion: string,
  currentVersion: string,
): boolean => {
  if (!recommendedVersion || !currentVersion) {
    return false;
  }

  const [major1, minor1, patch1] = recommendedVersion.split('.').map(Number);
  const [major2, minor2, patch2] = currentVersion.split('.').map(Number);

  if (major1 !== major2) {
    return major1 > major2;
  } else if (minor1 !== minor2) {
    return minor1 > minor2;
  } else {
    return patch1 > patch2;
  }
};

export const minimumVersionRequired = (
  minimumVersion: string,
  currentVersion: string,
): boolean => {
  if (!minimumVersion || !currentVersion) {
    return false;
  }

  const [major1, minor1, patch1] = minimumVersion.split('.').map(Number);
  const [major2, minor2, patch2] = currentVersion.split('.').map(Number);

  if (major1 !== major2) {
    return major2 > major1;
  } else if (minor1 !== minor2) {
    if (minor1 === undefined && !!minor2) return true;
    if (minor1 === undefined && minor2 === undefined) return true;
    return minor2 > minor1;
  } else {
    if (patch1 === undefined && !!patch2) return true;
    if (patch1 === undefined && (patch2 === undefined || isNaN(patch2)))
      return true;
    return patch2 >= patch1;
  }
};
