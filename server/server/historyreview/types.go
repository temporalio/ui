// Package historyreview scores the rows of a workflow event history for their
// importance to the outcome of the workflow.
//
// The package sends no payload contents and no failure messages: a row is a category,
// a name (an identifier such as an activity type), a classification, and counters.
// A TypeSafe System One model gives each distinct kind of row a Score. Code does the
// rest: it pins the rows that must always show (pending rows and failures; the client
// pins the first and the last row of the full history), removes duplicates so that 300
// identical rows cost one question, makes batches, and normalises the scores.
//
// A row that gets no score is never hidden: it fails visible, with score 1 and confidence 0.
package historyreview

import (
	"context"
	"fmt"

	"github.com/temporalio/ui-server/v2/server/typesafe"
)

// The limits of one review. They depend on one another, so change them together:
//
//   - MaxItems (1000) bounds one call. The client sends more calls for a longer history.
//   - MaxDistinctSignatures (200) bounds the cost of one call. Each distinct signature
//     is one row in the state and at most one Score question.
//   - MaxQuestionsPerRequest (50) bounds one TypeSafe request. Thus one call makes at
//     most 200 / 50 = 4 TypeSafe requests.
//   - MaxParallelRequests (4) is equal to that maximum, so the requests of one call
//     run as one wave, and one call takes about the time of one TypeSafe request.
//   - The rate limit cost of a call is its number of TypeSafe requests: 4 at most. The
//     default burst of the rate limit for each caller is 10 (config.DefaultTypeSafeBurst),
//     so a call of the maximum size always fits in a full bucket, 2 times. An operator
//     who sets a burst below 4 gets a clear 400 for the large calls.
//   - The largest TypeSafe request has 200 steps, a timeline of 1000 entries, and 50
//     questions. With names of the maximum length it is about 143 KB, and the 4
//     requests of one call are about 570 KB. TestRequestSizeHasABound holds the bounds.
const (
	MaxItems = 1000
	// MaxDistinctSignatures is the maximum number of distinct signatures in one call.
	MaxDistinctSignatures = 200
	// MaxQuestionsPerRequest is the maximum number of Score questions in one TypeSafe request.
	MaxQuestionsPerRequest = 50
	// MaxParallelRequests is the maximum number of TypeSafe requests in progress for one review.
	MaxParallelRequests = 4
	// MaxRequests is the maximum number of TypeSafe requests of one call.
	MaxRequests = MaxDistinctSignatures / MaxQuestionsPerRequest

	MaxNameLength           = 200
	MaxClassificationLength = 50
)

// DefaultModel is the model to use when the Reviewer does not name one.
const DefaultModel = "jev-latest"

// Item kinds.
const (
	KindGroup = "group"
	KindEvent = "event"
)

// PinnedScore is the score of a pinned row, and of a row that got no answer.
const PinnedScore = 1.0

var (
	// categories is the set of UI event categories.
	categories = map[string]bool{
		"activity": true, "child-workflow": true, "command": true, "local-activity": true,
		"marker": true, "nexus": true, "signal": true, "timer": true, "update": true,
		"workflow": true, "other": true,
	}

	// pinnedClassifications are the classifications of a row that is always important.
	pinnedClassifications = map[string]bool{
		"Failed": true, "TimedOut": true, "Canceled": true, "Terminated": true,
	}
)

type (
	// Evaluator answers typed questions about a state. *typesafe.Client satisfies it.
	Evaluator interface {
		Evaluate(ctx context.Context, req typesafe.Request) (typesafe.Response, error)
	}

	// Input is the part of a workflow history to review.
	Input struct {
		WorkflowType   string `json:"workflowType"`
		WorkflowStatus string `json:"workflowStatus"`
		// Items are the rows in history order.
		Items []Item `json:"items"`
	}

	// Item is one row: an event group or a plain event.
	Item struct {
		// ID is the stable group id or event id.
		ID   string `json:"id"`
		Kind string `json:"kind"`
		// Category is the UI event category.
		Category string `json:"category"`
		// Name is an identifier: an activity type, a signal name, a timer id, a child
		// workflow type, an update name, or the event type of a plain event.
		Name           string `json:"name"`
		Classification string `json:"classification"`
		EventCount     int    `json:"eventCount"`
		Attempt        int    `json:"attempt"`
		Pending        bool   `json:"pending"`
	}

	// Score is the result for one row.
	Score struct {
		// Score is the importance from 0 (routine) to 1 (cause or evidence of the outcome).
		Score float64 `json:"score"`
		// Confidence is 1 for a pinned row, and 0 for a row that got no answer.
		Confidence float64 `json:"confidence"`
		Pinned     bool    `json:"pinned"`
	}

	// Result has one Score for each item id of the input.
	Result struct {
		Scores map[string]Score `json:"scores"`
		Model  string           `json:"model"`
	}

	// ValidationError reports input that is outside the accepted limits.
	ValidationError struct {
		Field   string
		Message string
	}
)

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s %s", e.Field, e.Message)
}

func invalid(field, format string, args ...any) error {
	return &ValidationError{Field: field, Message: fmt.Sprintf(format, args...)}
}
