package historyreview

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strconv"
	"sync"

	"github.com/temporalio/ui-server/v2/server/typesafe"
)

// Reviewer scores the rows of a Plan.
type Reviewer struct {
	Evaluator Evaluator
	// Model is the System One model. An empty value selects DefaultModel.
	Model string
}

// Review sends the requests of the plan, at most MaxParallelRequests at one time, and
// gives one Score for each item id. When a request fails, Review stops the other
// requests and returns the error: it gives no partial result, because a half-scored
// history can hide the wrong rows without a sign to the user.
func (r *Reviewer) Review(ctx context.Context, plan *Plan) (Result, error) {
	if r.Evaluator == nil {
		return Result{}, errors.New("historyreview: no evaluator")
	}

	model := r.Model
	if model == "" {
		model = DefaultModel
	}

	answers, answeredBy, err := r.evaluate(ctx, plan.requests(model))
	if err != nil {
		return Result{}, fmt.Errorf("historyreview: evaluation failed: %w", err)
	}

	// A review with all rows pinned makes no call. It names the configured model.
	if answeredBy == "" {
		answeredBy = model
	}

	result := Result{Scores: make(map[string]Score, len(plan.items)), Model: answeredBy}
	for i, item := range plan.items {
		if plan.pinned[i] {
			result.Scores[item.ID] = Score{Score: PinnedScore, Confidence: 1, Pinned: true}
			continue
		}
		result.Scores[item.ID] = scoreOf(answers, questionID(plan.stepOf[i]))
	}
	return result, nil
}

// evaluate runs the requests with a bound on the parallel calls. It returns all the
// answers in one map (the question ids are unique in a plan) and the model that answered.
func (r *Reviewer) evaluate(ctx context.Context, requests []typesafe.Request) (map[string]typesafe.Answer, string, error) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	var (
		wg       sync.WaitGroup
		mu       sync.Mutex
		firstErr error
		model    string
		answers  = map[string]typesafe.Answer{}
		slots    = make(chan struct{}, MaxParallelRequests)
	)

	for _, request := range requests {
		// Wait for a slot, or stop when a request failed or the caller went away.
		select {
		case slots <- struct{}{}:
		case <-ctx.Done():
		}
		if ctx.Err() != nil {
			break
		}

		wg.Add(1)
		go func() {
			defer wg.Done()
			defer func() { <-slots }()

			response, err := r.Evaluator.Evaluate(ctx, request)

			mu.Lock()
			defer mu.Unlock()
			if err != nil {
				if firstErr == nil {
					firstErr = err
					cancel()
				}
				return
			}
			if model == "" {
				model = response.Model
			}
			for id, answer := range response.Answers {
				answers[id] = answer
			}
		}()
	}
	wg.Wait()

	if firstErr != nil {
		return nil, "", firstErr
	}
	if err := ctx.Err(); err != nil {
		return nil, "", err
	}
	return answers, model, nil
}

// scoreOf normalises a Score answer to 0..1.
//
// TypeSafe gives `score` as a position on the level number line, from 0 to the top
// level number: the sum of each level number times its probability. With 4 levels the
// range is 0..3, so the normalised score is score / 3. `confidence` is 0..1 and says
// how much the probabilities agree on one level.
//
// An answer that is absent, or that has no usable score, fails visible: score 1,
// confidence 0, not pinned. A row without a score must never be hidden.
func scoreOf(answers map[string]typesafe.Answer, id string) Score {
	unscored := Score{Score: PinnedScore, Confidence: 0, Pinned: false}
	top := float64(len(importanceLevels) - 1)

	answer, found := answers[id]
	if !found {
		return unscored
	}

	position, ok := positionOf(answer)
	if !ok {
		return unscored
	}

	confidence := 0.0
	if answer.Confidence != nil && !math.IsNaN(*answer.Confidence) {
		confidence = clamp(*answer.Confidence, 0, 1)
	}

	normalised := position / top
	if math.IsNaN(normalised) || math.IsInf(normalised, 0) {
		return unscored
	}

	return Score{Score: round4(clamp(normalised, 0, 1)), Confidence: round4(confidence)}
}

// positionOf reads the position on the level number line. It uses `score`. When the
// answer has no `score`, it computes the same sum from `probabilities`.
func positionOf(answer typesafe.Answer) (float64, bool) {
	if answer.Score != nil {
		if math.IsNaN(*answer.Score) || math.IsInf(*answer.Score, 0) {
			return 0, false
		}
		return *answer.Score, true
	}

	if len(answer.Probabilities) == 0 {
		return 0, false
	}
	position, total := 0.0, 0.0
	for level, probability := range answer.Probabilities {
		number, err := strconv.Atoi(level)
		if err != nil || number < 0 || number >= len(importanceLevels) || probability < 0 || math.IsNaN(probability) {
			return 0, false
		}
		position += float64(number) * probability
		total += probability
	}
	if total <= 0 {
		return 0, false
	}
	return position / total, true
}

// round4 keeps 4 decimal places: the response has 0.2, not 0.19999999999999998.
func round4(value float64) float64 {
	return math.Round(value*1e4) / 1e4
}

func clamp(value, low, high float64) float64 {
	return math.Min(math.Max(value, low), high)
}
