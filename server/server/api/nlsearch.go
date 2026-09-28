package api

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/nlsearch"
)

const NLSearchUrl = "/nl-search"

// maxNLSearchBodyBytes bounds the request body. The largest valid request is far smaller.
const maxNLSearchBodyBytes = 256 << 10

var nlSearchFeature = typeSafeFeature{
	scope:        "nl-search",
	enabled:      (*config.Config).NLSearchEnabled,
	label:        "natural-language search",
	maxBodyBytes: maxNLSearchBodyBytes,
	// One search is one TypeSafe request, so the cost is never above a burst.
	tooLargeMessage: "request too large for the configured rate limit",
}

// nlSearchRequest is the request body: the input of the translator and the namespace to authorize.
type nlSearchRequest struct {
	Namespace string `json:"namespace"`
	nlsearch.Input
}

func (r *nlSearchRequest) namespaceToAuthorize() string { return r.Namespace }

func (r *nlSearchRequest) validate() error { return r.Input.Validate() }

func (r *nlSearchRequest) typeSafeRequests() int { return 1 }

// NLSearchHandler translates a natural-language request into workflow filters. The
// gate does all the checks before the paid call: see TypeSafeGate.
func NLSearchHandler(gate *TypeSafeGate) echo.HandlerFunc {
	return func(c echo.Context) error {
		req := &nlSearchRequest{}
		return gate.run(c, nlSearchFeature, req, func(call *typeSafeCall) error {
			translator := &nlsearch.Translator{Model: call.Config.Model, Evaluator: call.Client}

			result, err := translator.Translate(c.Request().Context(), req.Input)
			if err != nil {
				var validationErr *nlsearch.ValidationError
				if errors.As(err, &validationErr) {
					return typeSafeError(c, http.StatusBadRequest, validationErr.Error())
				}
				return call.fail(err)
			}

			return c.JSON(http.StatusOK, result)
		})
	}
}
