# Pre-built images

ui-server can be consumed from Docker Hub: https://hub.docker.com/r/temporalio/ui

Check out our [docker-compose](https://github.com/temporalio/docker-compose) for a quick set up with Temporal Server.

## Quickstart for production

An example command to run the UI with Auth and TLS enabled

**Note**: For proper security you will also want to [enable authorization](https://docs.temporal.io/security/#authorization) on Temporal Server.

```shellscript
docker run \
    -e TEMPORAL_ADDRESS=127.0.0.1:7233 \
    -e TEMPORAL_UI_PORT=8080 \
    -e TEMPORAL_AUTH_ENABLED=true \
    -e TEMPORAL_AUTH_PROVIDER_URL=https://accounts.google.com \
    -e TEMPORAL_AUTH_CLIENT_ID=xxxxx-xxxx.apps.googleusercontent.com \
    -e TEMPORAL_AUTH_CLIENT_SECRET=xxxxxxxxxxxxxxx \
    -e TEMPORAL_AUTH_CALLBACK_URL=https://xxxx.com:8080/auth/sso/callback \
    -e TEMPORAL_AUTH_SCOPES=openid,email,profile \
    -e TEMPORAL_TLS_CA=../ca.cert \
    -e TEMPORAL_TLS_CERT=../cluster.pem \
    -e TEMPORAL_TLS_KEY=../cluster.key \
    -e TEMPORAL_TLS_ENABLE_HOST_VERIFICATION=true \
    -e TEMPORAL_TLS_SERVER_NAME=tls-server \
    temporalio/ui:latest
```

For all env options see [Config template file](./config/docker.yaml) or [Configuration Docs](https://docs.temporal.io/references/web-ui-configuration)

## Config template

The config file can use templating which uses [go's text templating](https://pkg.go.dev/text/template) and [Sprig's helpers](https://masterminds.github.io/sprig/).

To enable templating you can add a commented "# enable-template" line at the top of the file.

Note: Previously our docker images supported Dockerize for templating. This is now deprecated, and will be removed soon. If you have an existing custom config templating using dockerize, it will need to be adjusted to use Sprig's helpers. A good example of this is the `default` helper which uses a different argument ordering to dockerize.

## Serve UI under a sub-path

To change the public path under which the UI is served you can use the TEMPORAL_UI_PUBLIC_PATH environment variable.

```
docker run -d --network host -e TEMPORAL_UI_PUBLIC_PATH=/custom-path -t temporal-ui
```

Then navigate to http://localhost:8080/custom-path