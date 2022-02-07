import type { Payload } from '$types';

export interface RemoteDataConverterInterface {
  configured: boolean;
  isOpened(): boolean;
  open(): Promise<boolean>;
  decode(payload: Payload): Promise<Payload>;
}
