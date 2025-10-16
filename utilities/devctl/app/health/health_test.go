package health

import (
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

// fakeClient implements HTTPClient for testing.
type fakeClient struct {
	resp *http.Response
	err  error
}

// Get returns a preset response or error.
func (f *fakeClient) Get(url string) (*http.Response, error) {
	return f.resp, f.err
}

func TestCheckStatus_Success(t *testing.T) {
	// Create a fake response with status 200
	resp := &http.Response{
		StatusCode: 200,
		Body:       io.NopCloser(strings.NewReader("")),
	}
	client := &fakeClient{resp: resp, err: nil}
	ok, code, err := CheckStatus(client, "http://example.com", []int{200, 201})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok || code != 200 {
		t.Errorf("expected ok=true and code=200, got ok=%v code=%d", ok, code)
	}
}

func TestCheckStatus_NonMatchingCode(t *testing.T) {
	resp := &http.Response{
		StatusCode: 404,
		Body:       io.NopCloser(strings.NewReader("")),
	}
	client := &fakeClient{resp: resp, err: nil}
	ok, code, err := CheckStatus(client, "http://example.com", []int{200, 201})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ok || code != 404 {
		t.Errorf("expected ok=false and code=404, got ok=%v code=%d", ok, code)
	}
}

func TestCheckStatus_Error(t *testing.T) {
	clientErr := errors.New("network error")
	client := &fakeClient{resp: nil, err: clientErr}
	ok, code, err := CheckStatus(client, "http://example.com", []int{200})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if ok || code != 0 {
		t.Errorf("expected ok=false and code=0 on error, got ok=%v code=%d", ok, code)
	}
}

