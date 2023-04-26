import { AccountService } from '@buf/temporal_ocld-protos.bufbuild_connect-es/api/accountservice/v1/service_connect.js';

import { createPromiseClient } from '@bufbuild/connect';
import { grpcTransport } from './transport';

export const accountClient = createPromiseClient(AccountService, grpcTransport);
