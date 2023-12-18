module github.com/temporalio/ui-server/v2

go 1.20

require (
	github.com/coreos/go-oidc/v3 v3.1.0
	github.com/gogo/gateway v1.1.0
	github.com/gorilla/securecookie v1.1.1
	github.com/grpc-ecosystem/grpc-gateway v1.16.0
	github.com/labstack/echo/v4 v4.9.1
	github.com/stretchr/testify v1.8.4
	github.com/urfave/cli/v2 v2.3.0
	go.temporal.io/api v1.24.1-0.20231020155655-224b196919ea
	golang.org/x/net v0.17.0
	golang.org/x/oauth2 v0.11.0
	google.golang.org/grpc v1.59.0
	gopkg.in/validator.v2 v2.0.0-20210331031555-b37d688a7fb0
	gopkg.in/yaml.v3 v3.0.1
)

require (
	github.com/cpuguy83/go-md2man/v2 v2.0.1 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/labstack/gommon v0.4.0 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.17 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.1 // indirect
	golang.org/x/crypto v0.17.0 // indirect
	golang.org/x/sys v0.15.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	golang.org/x/time v0.3.0 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/genproto v0.0.0-20231016165738-49dd2c1f3d0b // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20231016165738-49dd2c1f3d0b // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20231016165738-49dd2c1f3d0b // indirect
	google.golang.org/protobuf v1.31.0 // indirect
	gopkg.in/square/go-jose.v2 v2.6.0 // indirect
)

replace github.com/grpc-ecosystem/grpc-gateway => github.com/temporalio/grpc-gateway v1.17.0
