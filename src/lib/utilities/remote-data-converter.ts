export interface RemoteDataConverterInterface {
  configured: boolean;
  isOpened(): boolean;
  open(): Promise<boolean>;
  sendRequest(data: any): Promise<any>;
}
