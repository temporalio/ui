package typesafe

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testAPIKey     = "sk-test-secret"
	okResponseBody = `{
		"model": "jev-1.13.0",
		"answers": {
			"is_failed": {"type": "noul", "noul": 0.95},
			"range": {"type": "choice", "choice": "yesterday", "probabilities": {"yesterday": 0.9, "none": 0.1}, "confidence": 0.81}
		},
		"usage": {"input_tokens": 120, "output_tokens": 2}
	}`
)

func testRequest() Request {
	return Request{
		Model: "jev-latest",
		State: map[string]any{"text": "failed workflows from yesterday"},
		Questions: map[string]Question{
			"is_failed": NewNoul("Does `text` ask for failed workflows?", "It does", "It does not"),
			"range":     NewChoice("Which time range does `text` name?", ChoiceCriteria{"yesterday": "The previous day", "none": "No time range"}),
		},
	}
}

// fakeTypeSafe replies with the given statuses in order, then repeats the last one.
func fakeTypeSafe(t *testing.T, calls *atomic.Int32, statuses ...int) *httptest.Server {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n := int(calls.Add(1))
		status := statuses[min(n, len(statuses))-1]

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		if status == http.StatusOK {
			_, _ = io.WriteString(w, okResponseBody)
			return
		}
		_, _ = io.WriteString(w, `{"error":"status `+http.StatusText(status)+`"}`)
	}))
	t.Cleanup(srv.Close)

	return srv
}

func TestEvaluateSendsContractRequest(t *testing.T) {
	var got struct {
		method, path, auth, contentType string
		body                            map[string]any
	}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got.method = r.Method
		got.path = r.URL.Path
		got.auth = r.Header.Get("Authorization")
		got.contentType = r.Header.Get("Content-Type")
		_ = json.NewDecoder(r.Body).Decode(&got.body)
		_, _ = io.WriteString(w, okResponseBody)
	}))
	defer srv.Close()

	// A trailing slash on the base URL must not produce a double slash.
	client := NewClient(Options{APIKey: testAPIKey, BaseURL: srv.URL + "/", HTTPClient: srv.Client()})

	res, err := client.Evaluate(context.Background(), testRequest())
	require.NoError(t, err)

	assert.Equal(t, http.MethodPost, got.method)
	assert.Equal(t, "/v1/systemone", got.path)
	assert.Equal(t, "Bearer "+testAPIKey, got.auth)
	assert.Equal(t, "application/json", got.contentType)
	assert.Equal(t, "jev-latest", got.body["model"])

	questions := got.body["questions"].(map[string]any)
	noul := questions["is_failed"].(map[string]any)
	assert.Equal(t, "noul", noul["type"])
	assert.Equal(t, map[string]any{"true": "It does", "false": "It does not"}, noul["criteria"])
	choice := questions["range"].(map[string]any)
	assert.Equal(t, "choice", choice["type"])
	assert.Equal(t, map[string]any{"yesterday": "The previous day", "none": "No time range"}, choice["criteria"])

	assert.Equal(t, "jev-1.13.0", res.Model)
	require.NotNil(t, res.Answers["is_failed"].Noul)
	assert.InDelta(t, 0.95, *res.Answers["is_failed"].Noul, 1e-9)
	assert.Equal(t, "yesterday", res.Answers["range"].Choice)
	require.NotNil(t, res.Answers["range"].Confidence)
	assert.InDelta(t, 0.81, *res.Answers["range"].Confidence, 1e-9)
	assert.Equal(t, 120, res.Usage.InputTokens)
}

func TestEvaluateRetryAndErrors(t *testing.T) {
	tests := []struct {
		name      string
		statuses  []int
		wantCalls int32
		wantErr   error
		wantCode  int
	}{
		{name: "success on first attempt", statuses: []int{200}, wantCalls: 1},
		{name: "retries 429 then succeeds", statuses: []int{429, 200}, wantCalls: 2},
		{name: "retries 529 then succeeds", statuses: []int{529, 529, 200}, wantCalls: 3},
		{name: "stops after three attempts on 429", statuses: []int{429}, wantCalls: 3, wantErr: ErrRateLimited, wantCode: 429},
		{name: "stops after three attempts on 529", statuses: []int{529}, wantCalls: 3, wantErr: ErrOverloaded, wantCode: 529},
		{name: "401 is not retried", statuses: []int{401}, wantCalls: 1, wantErr: ErrUnauthorized, wantCode: 401},
		{name: "422 is not retried", statuses: []int{422}, wantCalls: 1, wantErr: ErrInvalidRequest, wantCode: 422},
		{name: "500 is not retried", statuses: []int{500}, wantCalls: 1, wantCode: 500},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var calls atomic.Int32
			srv := fakeTypeSafe(t, &calls, tt.statuses...)
			client := NewClient(Options{
				APIKey:      testAPIKey,
				BaseURL:     srv.URL,
				HTTPClient:  srv.Client(),
				BaseBackoff: time.Millisecond,
			})

			res, err := client.Evaluate(context.Background(), testRequest())
			assert.Equal(t, tt.wantCalls, calls.Load())

			if tt.wantCode == 0 {
				require.NoError(t, err)
				assert.Len(t, res.Answers, 2)
				return
			}

			require.Error(t, err)
			var apiErr *APIError
			require.ErrorAs(t, err, &apiErr)
			assert.Equal(t, tt.wantCode, apiErr.StatusCode)
			assert.NotContains(t, err.Error(), testAPIKey)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
			}
			for _, other := range []error{ErrUnauthorized, ErrInvalidRequest, ErrRateLimited, ErrOverloaded} {
				if other != tt.wantErr {
					assert.False(t, errors.Is(err, other), "must not match %v", other)
				}
			}
		})
	}
}

func TestEvaluateTimeout(t *testing.T) {
	release := make(chan struct{})
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-release:
		case <-r.Context().Done():
		}
	}))
	defer srv.Close()
	defer close(release)

	client := NewClient(Options{APIKey: testAPIKey, BaseURL: srv.URL, HTTPClient: srv.Client(), Timeout: 30 * time.Millisecond})

	_, err := client.Evaluate(context.Background(), testRequest())
	require.Error(t, err)
	assert.ErrorIs(t, err, context.DeadlineExceeded)
	assert.NotContains(t, err.Error(), testAPIKey)
}

func TestEvaluateHonoursContextDuringBackoff(t *testing.T) {
	var calls atomic.Int32
	srv := fakeTypeSafe(t, &calls, 429)
	client := NewClient(Options{
		APIKey:      testAPIKey,
		BaseURL:     srv.URL,
		HTTPClient:  srv.Client(),
		Timeout:     time.Minute,
		BaseBackoff: time.Hour,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	start := time.Now()
	_, err := client.Evaluate(ctx, testRequest())
	require.Error(t, err)
	assert.ErrorIs(t, err, context.DeadlineExceeded)
	assert.Equal(t, int32(1), calls.Load())
	assert.Less(t, time.Since(start), 5*time.Second)
}

func TestEvaluateMalformedResponse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.WriteString(w, `{"answers": [`)
	}))
	defer srv.Close()

	client := NewClient(Options{APIKey: testAPIKey, BaseURL: srv.URL, HTTPClient: srv.Client()})

	_, err := client.Evaluate(context.Background(), testRequest())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "unable to decode response")
}

func TestChoiceConfidence(t *testing.T) {
	confidence := 0.81
	zero := 0.0

	tests := map[string]struct {
		answer Answer
		want   float64
		wantOK bool
	}{
		"confidence wins":                  {Answer{Choice: "a", Confidence: &confidence, Probabilities: map[string]float64{"a": 0.6}}, 0.81, true},
		"an explicit zero is a value":      {Answer{Choice: "a", Confidence: &zero, Probabilities: map[string]float64{"a": 0.6}}, 0, true},
		"falls back to the probability":    {Answer{Choice: "a", Probabilities: map[string]float64{"a": 0.6, "b": 0.4}}, 0.6, true},
		"no probability for the selection": {Answer{Choice: "a", Probabilities: map[string]float64{"b": 0.4}}, 0, false},
		"neither":                          {Answer{Choice: "a"}, 0, false},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			got, ok := tt.answer.ChoiceConfidence()
			assert.Equal(t, tt.wantOK, ok)
			assert.InDelta(t, tt.want, got, 1e-9)
		})
	}

	t.Run("a response without confidence decodes to nil", func(t *testing.T) {
		var answer Answer
		require.NoError(t, json.Unmarshal([]byte(`{"type":"choice","choice":"a","probabilities":{"a":0.7}}`), &answer))
		assert.Nil(t, answer.Confidence)
		got, ok := answer.ChoiceConfidence()
		assert.True(t, ok)
		assert.InDelta(t, 0.7, got, 1e-9)
	})
}

func TestBackoffShiftHasACap(t *testing.T) {
	client := NewClient(Options{BaseBackoff: time.Second})

	for _, retry := range []int{11, 64, 1000} {
		d := client.backoff(retry)
		assert.GreaterOrEqual(t, d, 512*time.Second)
		assert.LessOrEqual(t, d, 1024*time.Second)
	}
}

func TestBackoffGrowsAndStaysInRange(t *testing.T) {
	client := NewClient(Options{BaseBackoff: 100 * time.Millisecond})

	for retry, step := range map[int]time.Duration{1: 100 * time.Millisecond, 2: 200 * time.Millisecond} {
		for i := 0; i < 50; i++ {
			d := client.backoff(retry)
			assert.GreaterOrEqual(t, d, step/2)
			assert.LessOrEqual(t, d, step)
		}
	}
}
