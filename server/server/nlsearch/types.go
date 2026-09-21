// Package nlsearch translates a natural-language request into workflow list filters.
//
// The design is "select, do not generate". Code finds the candidate values in the
// text, a TypeSafe System One model selects among them and returns probabilities,
// and code builds the filters. The model never writes a value or a query, so a
// filter value is always a fixed keyword or text that the user typed.
//
// All the questions go out in one request (a speculative fan-out). The questions
// run in parallel and cannot see one another, so code uses only the answers that
// apply: for example, the amount and the unit apply only to a custom time range.
package nlsearch

import (
	"context"
	"fmt"
	"time"

	"github.com/temporalio/ui-server/v2/server/typesafe"
)

// Input limits. A violation gives a ValidationError.
const (
	MaxTextLength         = 500
	MaxSearchAttributes   = 100
	MaxKnownWorkflowTypes = 100
	MaxNameLength         = 200
	// MaxTimezoneOffsetMinutes is the largest offset from UTC, in each direction, that is accepted.
	MaxTimezoneOffsetMinutes = 14 * 60
)

// Judgment thresholds.
const (
	// StatusThreshold is the minimum noul for an ExecutionStatus filter.
	StatusThreshold = 0.6
	// PrefixThreshold is the minimum noul to make a WorkflowId filter a STARTS_WITH filter.
	PrefixThreshold = 0.6
	// MinChoiceConfidence is the minimum confidence for a choice answer to count.
	MinChoiceConfidence = 0.5
)

// Question limits.
const (
	// MaxCustomAttributes is the maximum number of custom attributes that get a question.
	MaxCustomAttributes = 20
	// MaxKeywordOptions is the maximum number of text candidates in the question of
	// one Keyword attribute. It bounds the size of the request: each Keyword
	// attribute gets the same candidates.
	MaxKeywordOptions = 25
	// maxCandidates leaves room for the "no answer" option of a choice question.
	maxCandidates = typesafe.MaxChoiceOptions - 1
)

// DefaultModel is the model to use when the Translator does not name one.
const DefaultModel = "jev-latest"

// Conditionals that a filter can use.
const (
	ConditionalEquals         = "="
	ConditionalGreaterOrEqual = ">="
	ConditionalLess           = "<"
	ConditionalStartsWith     = "STARTS_WITH"
)

// Search attribute names and types.
const (
	AttributeExecutionStatus = "ExecutionStatus"
	AttributeWorkflowType    = "WorkflowType"
	AttributeWorkflowID      = "WorkflowId"
	AttributeRunID           = "RunId"
	AttributeStartTime       = "StartTime"
	AttributeCloseTime       = "CloseTime"
	AttributeExecutionTime   = "ExecutionTime"

	TypeKeyword  = "Keyword"
	TypeBool     = "Bool"
	TypeDatetime = "Datetime"
)

type (
	// Evaluator answers typed questions about a state. *typesafe.Client satisfies it.
	Evaluator interface {
		Evaluate(ctx context.Context, req typesafe.Request) (typesafe.Response, error)
	}

	// Input is one natural-language search request.
	Input struct {
		Text string `json:"text"`
		// Now is the reference time for relative ranges.
		Now time.Time `json:"now"`
		// TimezoneOffsetMinutes is the local offset from UTC: local time = UTC + offset.
		// New York in summer is -240.
		TimezoneOffsetMinutes int `json:"timezoneOffsetMinutes"`
		// SearchAttributes maps each attribute name of the namespace to its type.
		SearchAttributes     map[string]string `json:"searchAttributes"`
		CustomAttributeNames []string          `json:"customAttributeNames"`
		KnownWorkflowTypes   []string          `json:"knownWorkflowTypes"`
	}

	// Filter is one condition. All filters join with AND, but several
	// ExecutionStatus filters mean OR between them.
	Filter struct {
		Attribute   string `json:"attribute"`
		Type        string `json:"type"`
		Conditional string `json:"conditional"`
		Value       string `json:"value"`
		// Confidence is the confidence of the weakest judgment that contributed to this filter.
		Confidence float64 `json:"confidence"`
	}

	// Result is the translation of one request.
	Result struct {
		Filters []Filter `json:"filters"`
		// Confidence is the minimum confidence across the filters, or 0 without filters.
		Confidence float64 `json:"confidence"`
		// Understood is false when no judgment crossed its threshold.
		Understood bool `json:"understood"`
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
