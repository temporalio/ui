package health

import (
	"net/http"
)

// HTTPClient defines the interface for making HTTP GET requests.
type HTTPClient interface {
	Get(url string) (*http.Response, error)
}

// CheckStatus performs a GET request to the given URL and checks if the response status code
// is in the provided list of acceptable codes. It returns a boolean indicating success,
// the actual status code, and any error encountered.
func CheckStatus(client HTTPClient, url string, codes []int) (bool, int, error) {
	resp, err := client.Get(url)
	if err != nil {
		return false, 0, err
	}
	defer resp.Body.Close()
	code := resp.StatusCode
	for _, c := range codes {
		if c == code {
			return true, code, nil
		}
	}
	return false, code, nil
}

// DefaultHealthInterval is the default interval (in seconds) between health check attempts.
const DefaultHealthInterval = 2

// DefaultHealthTimeout is the default timeout (in seconds) for health checks.
const DefaultHealthTimeout = 30

