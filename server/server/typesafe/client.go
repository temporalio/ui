package typesafe

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

const (
	// DefaultBaseURL is the public TypeSafe API.
	DefaultBaseURL = "https://api.typesafe.ai"
	// DefaultTimeout bounds one Evaluate call, retries included.
	DefaultTimeout = 5 * time.Second
	// DefaultMaxAttempts is the total number of tries for one Evaluate call.
	DefaultMaxAttempts = 3
	// DefaultBaseBackoff is the delay before the first retry. Each retry doubles it.
	DefaultBaseBackoff = 200 * time.Millisecond

	systemOnePath = "/v1/systemone"

	// statusOverloaded is the non-standard status that TypeSafe returns when it is overloaded.
	statusOverloaded = 529

	// maxBackoffShift keeps the exponential step from an overflow when MaxAttempts is large.
	maxBackoffShift = 10

	maxResponseBytes     = 4 << 20
	maxErrorMessageBytes = 2 << 10
)

var (
	// ErrUnauthorized matches an APIError with status 401 (the API key is not valid).
	ErrUnauthorized = errors.New("typesafe: unauthorized")
	// ErrInvalidRequest matches an APIError with status 422 (the request failed validation).
	ErrInvalidRequest = errors.New("typesafe: invalid request")
	// ErrRateLimited matches an APIError with status 429.
	ErrRateLimited = errors.New("typesafe: rate limited")
	// ErrOverloaded matches an APIError with status 529.
	ErrOverloaded = errors.New("typesafe: overloaded")
)

// APIError is a non-2xx response from TypeSafe. It never contains the API key.
type APIError struct {
	StatusCode int
	// Message is the start of the response body.
	Message string
}

func (e *APIError) Error() string {
	if e.Message == "" {
		return fmt.Sprintf("typesafe: unexpected status %d", e.StatusCode)
	}
	return fmt.Sprintf("typesafe: unexpected status %d: %s", e.StatusCode, e.Message)
}

// Is lets callers use errors.Is with the sentinel errors of this package.
func (e *APIError) Is(target error) bool {
	switch target {
	case ErrUnauthorized:
		return e.StatusCode == http.StatusUnauthorized
	case ErrInvalidRequest:
		return e.StatusCode == http.StatusUnprocessableEntity
	case ErrRateLimited:
		return e.StatusCode == http.StatusTooManyRequests
	case ErrOverloaded:
		return e.StatusCode == statusOverloaded
	}
	return false
}

// Retryable reports whether the same request can succeed later.
func (e *APIError) Retryable() bool {
	return e.StatusCode == http.StatusTooManyRequests || e.StatusCode == statusOverloaded
}

// Options configures a Client. The zero value of each field selects its default.
type Options struct {
	APIKey  string
	BaseURL string
	// HTTPClient sends the requests. Tests inject the client of an httptest.Server.
	HTTPClient *http.Client
	// Timeout bounds one Evaluate call, retries included.
	Timeout     time.Duration
	MaxAttempts int
	BaseBackoff time.Duration
}

// Client calls the TypeSafe System One API. It is safe for concurrent use.
type Client struct {
	apiKey      string
	endpoint    string
	httpClient  *http.Client
	timeout     time.Duration
	maxAttempts int
	baseBackoff time.Duration
}

// NewClient creates a Client.
func NewClient(opts Options) *Client {
	c := &Client{
		apiKey:      opts.APIKey,
		httpClient:  opts.HTTPClient,
		timeout:     opts.Timeout,
		maxAttempts: opts.MaxAttempts,
		baseBackoff: opts.BaseBackoff,
	}

	baseURL := opts.BaseURL
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	c.endpoint = strings.TrimRight(baseURL, "/") + systemOnePath

	if c.httpClient == nil {
		c.httpClient = http.DefaultClient
	}
	if c.timeout <= 0 {
		c.timeout = DefaultTimeout
	}
	if c.maxAttempts <= 0 {
		c.maxAttempts = DefaultMaxAttempts
	}
	if c.baseBackoff <= 0 {
		c.baseBackoff = DefaultBaseBackoff
	}

	return c
}

// Evaluate sends all the questions in one request. It tries again on 429 and 529
// with exponential backoff and jitter, and it stops when ctx ends.
func (c *Client) Evaluate(ctx context.Context, req Request) (Response, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return Response{}, fmt.Errorf("typesafe: unable to encode request: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	var lastErr error
	for attempt := 0; attempt < c.maxAttempts; attempt++ {
		if attempt > 0 {
			if err := sleep(ctx, c.backoff(attempt)); err != nil {
				return Response{}, fmt.Errorf("%w (last error: %v)", err, lastErr)
			}
		}

		res, err := c.send(ctx, body)
		if err == nil {
			return res, nil
		}

		var apiErr *APIError
		if !errors.As(err, &apiErr) || !apiErr.Retryable() {
			return Response{}, err
		}
		lastErr = err
	}

	return Response{}, lastErr
}

func (c *Client) send(ctx context.Context, body []byte) (Response, error) {
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return Response{}, fmt.Errorf("typesafe: unable to create request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	httpRes, err := c.httpClient.Do(httpReq)
	if err != nil {
		// Prefer the context error so callers can detect a timeout with errors.Is.
		if ctxErr := ctx.Err(); ctxErr != nil {
			return Response{}, fmt.Errorf("typesafe: request did not complete: %w", ctxErr)
		}
		return Response{}, fmt.Errorf("typesafe: request failed: %w", err)
	}
	defer httpRes.Body.Close()

	if httpRes.StatusCode < 200 || httpRes.StatusCode > 299 {
		msg, _ := io.ReadAll(io.LimitReader(httpRes.Body, maxErrorMessageBytes))
		return Response{}, &APIError{
			StatusCode: httpRes.StatusCode,
			Message:    strings.TrimSpace(string(msg)),
		}
	}

	var res Response
	if err := json.NewDecoder(io.LimitReader(httpRes.Body, maxResponseBytes)).Decode(&res); err != nil {
		if ctxErr := ctx.Err(); ctxErr != nil {
			return Response{}, fmt.Errorf("typesafe: request did not complete: %w", ctxErr)
		}
		return Response{}, fmt.Errorf("typesafe: unable to decode response: %w", err)
	}

	return res, nil
}

// backoff returns the delay before the given retry (1 = first retry):
// half of the exponential step plus a random jitter of up to the other half.
func (c *Client) backoff(retry int) time.Duration {
	step := c.baseBackoff << min(retry-1, maxBackoffShift)
	return step/2 + time.Duration(rand.Int63n(int64(step/2)+1))
}

func sleep(ctx context.Context, d time.Duration) error {
	timer := time.NewTimer(d)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return fmt.Errorf("typesafe: stopped before retry: %w", ctx.Err())
	case <-timer.C:
		return nil
	}
}
