import { getEnvironment } from './get-environment';

const validTargets = ['local', 'cloud'];

const throwErrorIfInvalid = (callback: () => boolean) => () => {
  const buildTarget = getEnvironment();
  const validOptions = `Valid options: ${validTargets.join(', ')}.`;

  if (process.env.NODE_ENV !== 'production' && !buildTarget) {
    process.env.VITE_TEMPORAL_UI_BUILD_TARGET = 'local';
  }

  if (!buildTarget) {
    throw new Error(
      `No VITE_TEMPORAL_UI_BUILD_TARGET environment variable provided. ${validOptions}`,
    );
  }

  if (!validTargets.includes(buildTarget)) {
    throw new Error(
      `Invalid VITE_TEMPORAL_UI_BUILD_TARGET. You provided: ${buildTarget}. ${validOptions}`,
    );
  }

  return callback();
};

export const isLocal = throwErrorIfInvalid(() => getEnvironment() === 'local');
export const isCloud = throwErrorIfInvalid(() => getEnvironment() === 'cloud');
