const validTargets = ['local', 'cloud'];

const throwErrorIfInvalid = (callback: () => boolean) => () => {
  const buildTarget = getEnvironment();
  const validOptions = `Valid options: ${validTargets.join(', ')}.`;

  if (!buildTarget) {
    throw new Error(
      `No TEMPORAL_UI_BUILD_TARGET environment variable provided. ${validOptions}`,
    );
  }

  if (!validTargets.includes(buildTarget)) {
    throw new Error(
      `Invalid TEMPORAL_UI_BUILD_TARGET. You provided: ${buildTarget}. ${validOptions}`,
    );
  }

  return callback();
};

export const getEnvironment: () => string = () => {
  return process.env.TEMPORAL_UI_BUILD_TARGET || 'local';
};

export const isLocal = throwErrorIfInvalid(() => getEnvironment() === 'local');
export const isCloud = throwErrorIfInvalid(() => getEnvironment() === 'cloud');
