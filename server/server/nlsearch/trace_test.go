package nlsearch

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/temporalio/ui-server/v2/server/typesafe"
)

func traceStep(t *testing.T, result Result, id string) TraceStep {
	t.Helper()
	for _, step := range result.Trace {
		if step.ID == id {
			return step
		}
	}
	require.Failf(t, "no trace step", "id %q", id)
	return TraceStep{}
}

func translateForTrace(t *testing.T, text string, answers map[string]typesafe.Answer) Result {
	t.Helper()
	fake := &fakeTypeSafe{unchecked: answers}
	result, err := newTestTranslator(t, fake).Translate(context.Background(), testInput(text))
	require.NoError(t, err)
	return result
}

func TestTraceRecordsEachQuestionInOrder(t *testing.T) {
	result := translateForTrace(t, "failed order workflows from yesterday", map[string]typesafe.Answer{
		"status_Failed": noul(0.97),
		"workflow_type": choice("OrderWorkflow", 0.91),
		"time_range":    choice(rangeYesterday, 0.88),
	})

	require.NotEmpty(t, result.Trace)
	assert.Equal(t, "status_Running", result.Trace[0].ID)
	assert.Equal(t, TraceStatus, result.Trace[0].Question)
	assert.Equal(t, "Running", result.Trace[0].Subject)

	failed := traceStep(t, result, "status_Failed")
	assert.Equal(t, OutcomeKept, failed.Outcome)
	assert.Equal(t, "noul", failed.Kind)
	require.NotNil(t, failed.Score)
	assert.InDelta(t, 0.97, *failed.Score, 1e-9)
	require.NotNil(t, failed.Threshold)
	assert.InDelta(t, StatusThreshold, *failed.Threshold, 1e-9)
	assert.Equal(t, []Filter{keyword("ExecutionStatus", "=", "Failed", 0.97)}, failed.Filters)

	running := traceStep(t, result, "status_Running")
	assert.Equal(t, OutcomeBelowThreshold, running.Outcome)
	assert.Empty(t, running.Filters)

	workflowType := traceStep(t, result, "workflow_type")
	assert.Equal(t, OutcomeKept, workflowType.Outcome)
	assert.Equal(t, "OrderWorkflow", workflowType.Answer)

	timeRange := traceStep(t, result, "time_range")
	assert.Equal(t, OutcomeKept, timeRange.Outcome)
	assert.Len(t, timeRange.Filters, 2)

	timeAttribute := traceStep(t, result, "time_attribute")
	assert.Equal(t, OutcomeNoMatch, timeAttribute.Outcome)
	assert.Equal(t, optionNone, timeAttribute.Answer)

	timeUnit := traceStep(t, result, "time_unit")
	assert.Equal(t, OutcomeUnused, timeUnit.Outcome)
	assert.Nil(t, timeUnit.Threshold)
}

func TestTraceMarksAnIncompleteCustomRange(t *testing.T) {
	result := translateForTrace(t, "workflows from the last 45 minutes", map[string]typesafe.Answer{
		"time_range": choice(rangeCustomRelative, 0.9),
		"time_unit":  choice(unitMinutes, 0.92),
	})

	assert.Equal(t, OutcomeIncomplete, traceStep(t, result, "time_range").Outcome)
	assert.Equal(t, OutcomeNoMatch, traceStep(t, result, "time_amount").Outcome)
	assert.Equal(t, OutcomeKept, traceStep(t, result, "time_unit").Outcome)
	assert.Empty(t, result.Filters)
}

func TestTraceMarksALowConfidenceChoice(t *testing.T) {
	result := translateForTrace(t, "order workflows", map[string]typesafe.Answer{
		"workflow_type": choice("OrderWorkflow", 0.3),
	})

	step := traceStep(t, result, "workflow_type")
	assert.Equal(t, OutcomeBelowThreshold, step.Outcome)
	require.NotNil(t, step.Threshold)
	assert.InDelta(t, MinChoiceConfidence, *step.Threshold, 1e-9)
}

func TestTraceMarksTheWeakerFilterOfAConflict(t *testing.T) {
	text := `show the "failed" tier for order-123`
	result := translateForTrace(t, text, withValueAnswers(t, text, map[string]typesafe.Answer{
		"status_Failed": noul(0.9),
		"workflow_type": choice("order-123", 0.6),
	}, map[string]valueAnswers{
		"failed":    {choice("CustomerTier", 0.7), choice("equals", 0.9)},
		"order-123": {choice("WorkflowId", 0.8), choice("equals", 0.9)},
	}))

	assert.Equal(t, OutcomeKept, traceStep(t, result, "status_Failed").Outcome)
	assert.Equal(t, OutcomeConflict, traceStep(t, result, "workflow_type").Outcome)

	failed := valueStep(t, result, TraceValueAttribute, "failed")
	assert.Equal(t, "CustomerTier", failed.Answer)
	assert.Equal(t, OutcomeConflict, failed.Outcome)
	assert.Equal(t, OutcomeKept, valueStep(t, result, TraceValueAttribute, "order-123").Outcome)
}

func TestTraceRecordsTheAttributeAndComparisonOfAValue(t *testing.T) {
	text := "workflow id starts with agent"
	result := translateForTrace(t, text, withValueAnswers(t, text, nil, map[string]valueAnswers{
		"agent": {choice("WorkflowId", 0.86), choice("starts_with", 0.93)},
	}))

	attribute := valueStep(t, result, TraceValueAttribute, "agent")
	assert.Equal(t, OutcomeKept, attribute.Outcome)
	assert.Equal(t, "WorkflowId", attribute.Answer)
	assert.Equal(t, []Filter{keyword("WorkflowId", "STARTS_WITH", "agent", 0.86)}, attribute.Filters)

	comparison := valueStep(t, result, TraceValueComparison, "agent")
	assert.Equal(t, OutcomeKept, comparison.Outcome)
	assert.Equal(t, "starts_with", comparison.Answer)
}

func TestTraceMarksAComparisonTheTypeDoesNotAllow(t *testing.T) {
	text := "attempts starting with 3"
	result := translateForTrace(t, text, withValueAnswers(t, text, nil, map[string]valueAnswers{
		"3": {choice("Attempts", 0.9), choice("starts_with", 0.9)},
	}))

	assert.Equal(t, OutcomeIncomplete, valueStep(t, result, TraceValueAttribute, "3").Outcome)
	assert.Empty(t, result.Filters)
}

func valueStep(t *testing.T, result Result, question, value string) TraceStep {
	t.Helper()
	for _, step := range result.Trace {
		if step.Question == question && step.Subject == value {
			return step
		}
	}
	require.Failf(t, "no value step", "%s for %q", question, value)
	return TraceStep{}
}
