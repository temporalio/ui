import { derived } from 'svelte/store';
import { page } from '$app/stores';
import {
  dataEncoderEndpoint,
  lastDataEncoderStatus,
} from './data-encoder-config';
import { authUser } from './auth-user';

export const dataEncoder = derived(
  [page, dataEncoderEndpoint, lastDataEncoderStatus, authUser],
  ([$page, $dataEncoderEndpoint, $lastDataEncoderStatus, $authUser]) => {
    const namespace = $page.params.namespace;
    const settingsEndpoint = $page?.stuff?.settings?.codec?.endpoint;
    const endpoint = $dataEncoderEndpoint || settingsEndpoint;
    const passAccessToken = $page.stuff?.settings?.codec?.passAccessToken;
    const accessToken = $authUser?.accessToken;
    const hasNotRequested = $lastDataEncoderStatus === 'notRequested';
    const hasError = $lastDataEncoderStatus === 'error';
    const hasSuccess = $lastDataEncoderStatus === 'success';

    return {
      namespace,
      settingsEndpoint,
      endpoint,
      passAccessToken,
      accessToken,
      hasNotRequested,
      hasError,
      hasSuccess,
    };
  },
);
