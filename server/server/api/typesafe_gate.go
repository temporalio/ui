package api

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"math"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/labstack/echo/v4"
	"google.golang.org/grpc"

	"github.com/temporalio/ui-server/v2/server/auth"
	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/ratelimit"
	"github.com/temporalio/ui-server/v2/server/typesafe"
)

const (
	// statusClientClosedRequest is the de facto status for a request that the client canceled.
	statusClientClosedRequest = 499

	// describeNamespacePath is the HTTP API path of DescribeNamespace. The Temporal
	// authorizer treats DescribeNamespace as a read-only API with namespace scope,
	// so it answers "can this caller read this namespace" at a low cost.
	describeNamespacePath = "/api/v1/namespaces/"

	maxNamespaceLength = 200
)

// TypeSafeErrorResponse is the body of each error from an endpoint that uses TypeSafe.
type TypeSafeErrorResponse struct {
	Message string `json:"message"`
}

// TypeSafeGate is the one entry to each endpoint that calls the paid TypeSafe API. All
// those endpoints share it, so a new endpoint cannot drift from the reviewed order of
// the checks. They also share one limiter, because one deployment has one TypeSafe key.
type TypeSafeGate struct {
	cfgProvider   *config.ConfigProviderWithRefresh
	apiMiddleware []Middleware
	conn          *grpc.ClientConn
	limiter       *ratelimit.Limiter
	httpClient    *http.Client
}

// NewTypeSafeGate creates the gate. conn and apiMiddleware are those of TemporalAPIHandler.
func NewTypeSafeGate(cfgProvider *config.ConfigProviderWithRefresh, apiMiddleware []Middleware, conn *grpc.ClientConn, limiter *ratelimit.Limiter) *TypeSafeGate {
	return &TypeSafeGate{
		cfgProvider:   cfgProvider,
		apiMiddleware: apiMiddleware,
		conn:          conn,
		limiter:       limiter,
		httpClient:    &http.Client{},
	}
}

// typeSafeFeature describes one endpoint for the gate.
type typeSafeFeature struct {
	// scope is the endpoint name in the rate limit scopes and in the log.
	scope string
	// enabled reads the feature gate from the config of the request.
	enabled func(cfg *config.Config) bool
	// label names the feature in messages, such as "natural-language search".
	label string
	// maxBodyBytes bounds the request body.
	maxBodyBytes int64
	// tooLargeMessage is the 400 message for a request whose cost can never pass the rate limit.
	tooLargeMessage string
}

// typeSafeRequestBody is a request body that names the namespace to authorize.
type typeSafeRequestBody interface {
	namespaceToAuthorize() string
	// validate checks the limits of the body. It makes no network call.
	validate() error
	// typeSafeRequests is the number of TypeSafe requests that the endpoint makes for
	// this body. The gate calls it after validate. It is the cost for the rate limit.
	typeSafeRequests() int
}

// typeSafeCall is what the gate gives to the endpoint after all the checks passed.
type typeSafeCall struct {
	echo  echo.Context
	label string
	// Config has the defaults applied.
	Config config.TypeSafe
	// Client is the TypeSafe client for this request.
	Client *typesafe.Client
}

// run applies the checks in the reviewed order, and then calls the endpoint:
//  1. 404 when the feature is off. The config is read on each request, so a config reload applies.
//  2. Rate limit, first part: the gate takes 1 token before it reads the body: see
//     TypeSafeRateLimitChecks. The full cost is not known yet.
//  3. The same auth header validation as TemporalAPIHandler.
//  4. Body: size bound, JSON, namespace characters, and the limits of the endpoint.
//  5. Cost: 400 when the number of TypeSafe requests is above the burst. Such a request
//     can never pass, so it must not get a 429, and it must not cost a gRPC round trip.
//  6. Authorization: one DescribeNamespace call to the Temporal frontend, through the same
//     gateway mux and API middleware as TemporalAPIHandler, so the credentials of the
//     caller go to the frontend in the same way. The ui-server does not authorize by
//     itself: the frontend does.
//  7. Rate limit, second part: the gate takes the remainder (cost - 1) for a request
//     that makes more than one TypeSafe request. A caller without authorization
//     cannot use those tokens.
//
// Token accounting: the token of step 2 is not given back when a later step denies
// the request (400, 401, 403, or the 429 of step 7). That is deliberate: each request
// that reaches the server costs 1 token, so a client that sends bad requests in a
// loop meets the limit too. The tokens of step 7 are all or nothing.
//
// The endpoint code runs only after step 7, so no step can be skipped.
func (g *TypeSafeGate) run(c echo.Context, feature typeSafeFeature, body typeSafeRequestBody, endpoint func(call *typeSafeCall) error) error {
	cfg, err := g.cfgProvider.GetConfig()
	if err != nil {
		log.Printf("[TypeSafe] %s: unable to read the config: %v", feature.scope, err)
		return typeSafeError(c, http.StatusInternalServerError, "unable to read the server configuration")
	}

	if !feature.enabled(cfg) {
		return typeSafeError(c, http.StatusNotFound, feature.label+" is not enabled")
	}

	// The defaults come first: a config with no rateLimit block has the default limit, not "no limit".
	tsCfg := cfg.TypeSafe.WithDefaults()
	checks := TypeSafeRateLimitChecks(c, feature.scope, tsCfg.RateLimit)

	if ok, retryAfter := g.limiter.Allow(checks...); !ok {
		return typeSafeRateLimited(c, retryAfter)
	}

	if err := auth.ValidateAuthHeaderExists(c, g.cfgProvider); err != nil {
		return typeSafeAuthError(c, err)
	}

	c.Request().Body = http.MaxBytesReader(c.Response(), c.Request().Body, feature.maxBodyBytes)
	if err := c.Bind(body); err != nil {
		return typeSafeError(c, http.StatusBadRequest, "invalid request body")
	}

	if err := validateNamespace(body.namespaceToAuthorize()); err != nil {
		return typeSafeError(c, http.StatusBadRequest, err.Error())
	}
	if err := body.validate(); err != nil {
		return typeSafeError(c, http.StatusBadRequest, err.Error())
	}

	cost := body.typeSafeRequests()
	if maxCost, limited := ratelimit.MaxCost(checks...); limited && cost > maxCost {
		return typeSafeError(c, http.StatusBadRequest, feature.tooLargeMessage)
	}

	if status, message := authorizeNamespace(c, g.conn, g.apiMiddleware, body.namespaceToAuthorize(), tsCfg.Timeout); status != http.StatusOK {
		return typeSafeError(c, status, message)
	}

	if cost > 1 {
		if result := g.limiter.AllowN(cost-1, checks...); !result.Allowed {
			if result.TooLarge {
				return typeSafeError(c, http.StatusBadRequest, feature.tooLargeMessage)
			}
			return typeSafeRateLimited(c, result.RetryAfter)
		}
	}

	return endpoint(&typeSafeCall{
		echo:   c,
		label:  feature.label,
		Config: tsCfg,
		Client: typesafe.NewClient(typesafe.Options{
			APIKey:     tsCfg.APIKey,
			BaseURL:    tsCfg.BaseURL,
			HTTPClient: g.httpClient,
			Timeout:    tsCfg.Timeout,
		}),
	})
}

// fail maps an error of a TypeSafe call to a response. The browser gets a generic
// message. The error never contains the API key.
func (call *typeSafeCall) fail(err error) error {
	// The caller went away. That is not a failure of TypeSafe: no error log and no 502.
	if errors.Is(err, context.Canceled) {
		return typeSafeError(call.echo, statusClientClosedRequest, "the request was canceled")
	}

	log.Printf("[TypeSafe] %s failed: %v", call.label, err)

	var netErr net.Error
	if errors.Is(err, context.DeadlineExceeded) || (errors.As(err, &netErr) && netErr.Timeout()) {
		return typeSafeError(call.echo, http.StatusGatewayTimeout, call.label+" timed out")
	}

	return typeSafeError(call.echo, http.StatusBadGateway, call.label+" is not available")
}

func typeSafeRateLimited(c echo.Context, retryAfter time.Duration) error {
	seconds := max(int(math.Ceil(retryAfter.Seconds())), 1)
	c.Response().Header().Set(echo.HeaderRetryAfter, strconv.Itoa(seconds))
	return typeSafeError(c, http.StatusTooManyRequests, "too many requests, try again later")
}

const (
	// typeSafeDeploymentScope is the same for each endpoint that uses the TypeSafe key
	// of the deployment, so all of them use one deployment bucket.
	typeSafeDeploymentScope = "typesafe:deployment"

	// ipLimitFactor makes the limit for each IP more generous than the limit for each
	// caller. Many callers can be behind one IP (NAT). Behind a reverse proxy, when
	// the Echo instance has no IPExtractor, ALL callers have the IP of the proxy and
	// share this bucket.
	ipLimitFactor = 4
	// deploymentBurstDivisor gives the deployment bucket a burst of 10 seconds of its rate.
	deploymentBurstDivisor = 6
)

// TypeSafeRateLimitChecks gives the layered rate limit checks for an endpoint that
// calls TypeSafe. The limiter applies them in this order and denies if one denies:
//
//  1. One bucket for the deployment. It protects the quota of the TypeSafe key of
//     the deployment, which is the purpose of the limit. A caller that rotates tokens
//     or addresses cannot get past it.
//  2. One bucket for each peer IP, with 4 times the caller limit. It bounds a caller that rotates tokens.
//  3. One bucket for each caller: see RateLimitCallerKey.
//
// The limiter takes the tokens only when all three buckets admit the request, so a
// denied request uses no token: see ratelimit.Limiter.AllowN.
//
// The endpoint name keeps the IP and caller buckets of two endpoints apart.
func TypeSafeRateLimitChecks(c echo.Context, endpoint string, rateLimit config.TypeSafeRateLimit) []ratelimit.Check {
	if rateLimit.Disabled {
		return nil
	}
	// A config without defaults must never mean "no limit".
	rateLimit = rateLimit.WithDefaults()

	// The deployment burst is 10 seconds of the deployment rate, and at least the caller
	// burst. It is never more than one minute of the deployment rate.
	deployment := ratelimit.Limit{
		RequestsPerMinute: rateLimit.DeploymentRequestsPerMinute,
		Burst: min(
			max(rateLimit.Burst, rateLimit.DeploymentRequestsPerMinute/deploymentBurstDivisor),
			rateLimit.DeploymentRequestsPerMinute,
		),
	}
	perIP := ratelimit.Limit{
		RequestsPerMinute: rateLimit.RequestsPerMinute * ipLimitFactor,
		Burst:             rateLimit.Burst * ipLimitFactor,
	}
	perCaller := ratelimit.Limit{
		RequestsPerMinute: rateLimit.RequestsPerMinute,
		Burst:             rateLimit.Burst,
	}

	return []ratelimit.Check{
		{Scope: typeSafeDeploymentScope, Limit: deployment},
		{Scope: endpoint + ":ip", Key: remoteIP(c), Limit: perIP},
		{Scope: endpoint + ":caller", Key: RateLimitCallerKey(c), Limit: perCaller},
	}
}

// RateLimitCallerKey identifies the caller for a rate limit: a hash of the
// Authorization header when the request has one, and the remote IP when it has none.
// The key never contains the token.
func RateLimitCallerKey(c echo.Context) string {
	if token := c.Request().Header.Get(echo.HeaderAuthorization); token != "" {
		sum := sha256.Sum256([]byte(token))
		return "auth:" + hex.EncodeToString(sum[:])
	}
	return "ip:" + remoteIP(c)
}

// remoteIP gives the address of the connection. It reads the forwarding headers only
// when the Echo instance has an IPExtractor, which says which proxies to trust.
// Without that rule, a caller can set X-Forwarded-For to get a new bucket for each request.
func remoteIP(c echo.Context) string {
	if c.Echo() != nil && c.Echo().IPExtractor != nil {
		return c.RealIP()
	}
	host, _, err := net.SplitHostPort(c.Request().RemoteAddr)
	if err != nil {
		return c.Request().RemoteAddr
	}
	return host
}

func validateNamespace(namespace string) error {
	if strings.TrimSpace(namespace) == "" {
		return errors.New("namespace is required")
	}
	if utf8.RuneCountInString(namespace) > maxNamespaceLength {
		return errors.New("namespace is too long")
	}
	// The namespace goes into the path of the internal DescribeNamespace request. The
	// check must be about this namespace and no other resource, and it must not depend
	// on how the gateway removes the escapes from a path.
	for _, r := range namespace {
		if strings.ContainsRune(`/\?#%`, r) || unicode.IsControl(r) {
			return errors.New("namespace has a character that is not permitted")
		}
	}
	return nil
}

// authorizeNamespace asks the Temporal frontend whether the caller can read the
// namespace. It sends an internal DescribeNamespace request through the same gateway
// mux as TemporalAPIHandler. Thus the Authorization header, the Authorization-Extras
// header, the configured forward headers, and the client version headers go to the
// frontend in the same way as for each other API call. It returns http.StatusOK when
// the frontend accepts the call.
func authorizeNamespace(c echo.Context, conn *grpc.ClientConn, apiMiddleware []Middleware, namespace string, timeout time.Duration) (int, string) {
	mux, err := getTemporalClientMux(c, conn, apiMiddleware)
	if err != nil {
		log.Printf("[TypeSafe] unable to create the API client: %v", err)
		return http.StatusBadGateway, "unable to reach the Temporal server"
	}

	original := c.Request()
	ctx, cancel := context.WithTimeout(original.Context(), timeout)
	defer cancel()

	check, err := http.NewRequestWithContext(ctx, http.MethodGet, describeNamespacePath+url.PathEscape(namespace), nil)
	if err != nil {
		return http.StatusBadRequest, "namespace is not valid"
	}
	check.Header = original.Header.Clone()
	check.Header.Del(echo.HeaderContentType)
	check.Header.Del(echo.HeaderContentLength)
	check.RemoteAddr = original.RemoteAddr

	recorder := &statusRecorder{header: http.Header{}}
	mux.ServeHTTP(recorder, check)

	status, message := namespaceCheckResult(recorder.Status(), original.Context().Err() != nil, namespace)
	if status == http.StatusBadGateway {
		log.Printf("[TypeSafe] the namespace check failed with status %d: %s", recorder.Status(), recorder.body.String())
	}
	return status, message
}

// namespaceCheckResult maps the status of the DescribeNamespace response to the
// result of the authorization. Only an explicit 200 allows the request. Each status
// that the gate does not know, and a response with no status (0), denies with 502.
func namespaceCheckResult(checkStatus int, callerCanceled bool, namespace string) (int, string) {
	switch {
	case checkStatus == http.StatusOK:
		return http.StatusOK, ""
	case checkStatus == http.StatusUnauthorized:
		return http.StatusUnauthorized, "unauthorized"
	case checkStatus == http.StatusForbidden:
		return http.StatusForbidden, "you do not have access to namespace " + strconv.Quote(namespace)
	case checkStatus == http.StatusNotFound:
		return http.StatusBadRequest, "namespace " + strconv.Quote(namespace) + " was not found"
	case callerCanceled:
		return statusClientClosedRequest, "the request was canceled"
	case checkStatus == http.StatusGatewayTimeout:
		return http.StatusGatewayTimeout, "the Temporal server did not answer in time"
	default:
		return http.StatusBadGateway, "unable to verify access to the namespace"
	}
}

// statusRecorder is a minimal http.ResponseWriter for the internal namespace check.
type statusRecorder struct {
	header http.Header
	status int
	body   bytes.Buffer
}

func (r *statusRecorder) Header() http.Header { return r.header }

func (r *statusRecorder) WriteHeader(status int) {
	if r.status == 0 {
		r.status = status
	}
}

func (r *statusRecorder) Write(data []byte) (int, error) {
	r.WriteHeader(http.StatusOK)
	// Keep only the start of the body: it is for the log.
	if room := 1024 - r.body.Len(); room > 0 {
		r.body.Write(data[:min(room, len(data))])
	}
	return len(data), nil
}

// Status gives the recorded status, or 0 when the handler wrote nothing. It never
// assumes 200: an authorization gate must not allow a request when it learned nothing.
func (r *statusRecorder) Status() int {
	return r.status
}

// typeSafeAuthError writes the error of the auth header validation in the error format of these endpoints.
func typeSafeAuthError(c echo.Context, err error) error {
	var httpErr *echo.HTTPError
	if errors.As(err, &httpErr) {
		message, ok := httpErr.Message.(string)
		if !ok {
			message = http.StatusText(httpErr.Code)
		}
		return typeSafeError(c, httpErr.Code, message)
	}

	log.Printf("[TypeSafe] unable to validate auth: %v", err)
	return typeSafeError(c, http.StatusInternalServerError, "unable to validate auth")
}

func typeSafeError(c echo.Context, status int, message string) error {
	return c.JSON(status, &TypeSafeErrorResponse{Message: message})
}
