package e2e

import (
	"context"
	"time"

	"go.temporal.io/sdk/workflow"
)

func Workflow(ctx workflow.Context, input string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	lao := workflow.LocalActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)
	ctx = workflow.WithLocalActivityOptions(ctx, lao)

	var result string

	workflow.SetQueryHandler(ctx, "current_result", func() (string, error) {
		return result, nil
	})

	err := workflow.SideEffect(ctx, func(ctx workflow.Context) interface{} {
		return "Side Effect for " + input
	}).Get(&result)
	if err != nil {
		return "", err
	}

	err = workflow.ExecuteLocalActivity(ctx, Activity, input).Get(ctx, &result)
	if err != nil {
		return "", err
	}

	err = workflow.ExecuteActivity(ctx, Activity, input).Get(ctx, &result)
	if err != nil {
		return "", err
	}

	return result, nil
}

func Activity(ctx context.Context, input string) (string, error) {
	return "Received " + input, nil
}
