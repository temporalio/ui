module github.com/temporalio/ui-server/v2

go 1.20

require (
	github.com/coreos/go-oidc/v3 v3.1.0
	github.com/gorilla/securecookie v1.1.1
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.20.0
	github.com/labstack/echo/v4 v4.9.1
	github.com/stretchr/testify v1.9.0
	github.com/urfave/cli/v2 v2.3.0
	go.temporal.io/api v1.36.0
	golang.org/x/net v0.27.0
	golang.org/x/oauth2 v0.20.0
	google.golang.org/grpc v1.65.0
	google.golang.org/protobuf v1.34.2
	gopkg.in/validator.v2 v2.0.0-20210331031555-b37d688a7fb0
	gopkg.in/yaml.v3 v3.0.1
)

require (
	github.com/cpuguy83/go-md2man/v2 v2.0.1 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/labstack/gommon v0.4.0 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.17 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.1 // indirect
	golang.org/x/crypto v0.25.0 // indirect
	golang.org/x/sys v0.22.0 // indirect
	golang.org/x/text v0.16.0 // indirect
	golang.org/x/time v0.3.0 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20240711142825-46eb208f015d // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240711142825-46eb208f015d // indirect
	gopkg.in/square/go-jose.v2 v2.6.0 // indirect
)

replace github.com/grpc-ecosystem/grpc-gateway => github.com/temporalio/grpc-gateway v1.17.0
