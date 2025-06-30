export interface CodecServerFormData {
  endpoint: string;
  passUserAccessToken: boolean;
  includeCrossOriginCredentials: boolean;
  customMessage?: string;
  customLink?: string;
}

// The actual data structure as JSON payload
export interface CodecServerJsonData {
  endpoint: string;
  passUserAccessToken: boolean;
  includeCrossOriginCredentials: boolean;
  customMessage?: string;
  customLink?: string;
}

// This matches the actual API response structure
export interface CodecServerApiData {
  Endpoint: string;
  PassAccessToken?: boolean;
  IncludeCredentials?: boolean;
  DefaultErrorMessage?: string;
  DefaultErrorLink?: string;
}

export interface CodecServerAdapter {
  fetchCodecServer(): Promise<CodecServerFormData>;
  saveCodecServer(data: CodecServerFormData): Promise<void>;
  onSuccess?: (data: CodecServerFormData) => void;
  onCancel?: () => void;
}
