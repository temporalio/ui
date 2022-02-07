import type { Payload } from '$types';

export interface RemoteDataConverterInterface {
  configured: boolean;
  isOpened(): boolean;
  open(): Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendRequest(payload: Payload): Promise<any>;
}
