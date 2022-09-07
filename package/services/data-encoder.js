import { setLastDataEncoderFailure, setLastDataEncoderSuccess, } from '../stores/data-encoder-config';
import { validateHttps } from '../utilities/is-http';
export async function convertPayloadsWithCodec({ payloads, namespace, settings, }) {
    const { endpoint, accessToken } = settings.codec;
    const headers = {
        'Content-Type': 'application/json',
        'X-Namespace': namespace,
    };
    if (accessToken) {
        if (validateHttps(endpoint)) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        else {
            setLastDataEncoderFailure();
            return payloads;
        }
    }
    const encoderResponse = fetch(endpoint + '/decode', {
        headers,
        method: 'POST',
        body: JSON.stringify(payloads),
    })
        .then((r) => r.json())
        .then((response) => {
        setLastDataEncoderSuccess();
        return response;
    })
        .catch(() => {
        setLastDataEncoderFailure();
        return payloads;
    });
    return encoderResponse;
}
