package api

import (
	"context"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/historyreview"
)

const HistoryReviewUrl = "/history-review"

// maxHistoryReviewBodyBytes bounds the request body: 1000 items with names of the maximum length fit.
const maxHistoryReviewBodyBytes = 1 << 20

const historyTooLargeMessage = "history too large for the configured rate limit: send fewer items in one call"

var historyReviewFeature = typeSafeFeature{
	scope:           "history-review",
	enabled:         (*config.Config).HistoryReviewEnabled,
	label:           "history review",
	maxBodyBytes:    maxHistoryReviewBodyBytes,
	tooLargeMessage: historyTooLargeMessage,
}

// historyReviewRequest is the request body: the rows to score and the namespace to authorize.
type historyReviewRequest struct {
	Namespace string `json:"namespace"`
	historyreview.Input

	// plan is complete after validate, before the authorization and before each paid call.
	plan *historyreview.Plan
}

func (r *historyReviewRequest) namespaceToAuthorize() string { return r.Namespace }

func (r *historyReviewRequest) validate() error {
	plan, err := historyreview.NewPlan(r.Input)
	r.plan = plan
	return err
}

// typeSafeRequests is the cost of the review. It is 0 when all the rows are pinned.
func (r *historyReviewRequest) typeSafeRequests() int { return r.plan.RequestCount() }

// maxHistoryReviewDuration is the upper bound of the deadline of one review.
const maxHistoryReviewDuration = 30 * time.Second

// HistoryReviewHandler scores the rows of a workflow event history. The gate does all
// the checks before the paid calls, and it charges the rate limit for all the
// TypeSafe requests of the review before the first one: see TypeSafeGate. A failure
// of one request fails the review: the response never has partial scores.
//
// The review has one deadline: the TypeSafe timeout for each wave of parallel
// requests, and maxHistoryReviewDuration at most. A review past the deadline gets 504.
func HistoryReviewHandler(gate *TypeSafeGate) echo.HandlerFunc {
	return func(c echo.Context) error {
		req := &historyReviewRequest{}
		return gate.run(c, historyReviewFeature, req, func(call *typeSafeCall) error {
			deadline := min(call.Config.Timeout*time.Duration(max(req.plan.WaveCount(), 1)), maxHistoryReviewDuration)
			ctx, cancel := context.WithTimeout(c.Request().Context(), deadline)
			defer cancel()

			reviewer := &historyreview.Reviewer{Model: call.Config.Model, Evaluator: call.Client}
			result, err := reviewer.Review(ctx, req.plan)
			if err != nil {
				return call.fail(err)
			}

			return c.JSON(http.StatusOK, result)
		})
	}
}
