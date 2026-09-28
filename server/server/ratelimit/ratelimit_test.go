package ratelimit

import (
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeClock struct{ now time.Time }

func (c *fakeClock) Now() time.Time          { return c.now }
func (c *fakeClock) Advance(d time.Duration) { c.now = c.now.Add(d) }

func caller(key string, limit Limit) Check {
	return Check{Scope: "test:caller", Key: key, Limit: limit}
}

func newClock() *fakeClock {
	return &fakeClock{now: time.Date(2026, time.September, 20, 12, 0, 0, 0, time.UTC)}
}

func TestAllowBurstThenRefill(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now})
	limit := Limit{RequestsPerMinute: 30, Burst: 3}

	for i := 0; i < 3; i++ {
		ok, _ := limiter.Allow(caller("caller", limit))
		assert.True(t, ok, "request %d is inside the burst", i)
	}

	ok, retryAfter := limiter.Allow(caller("caller", limit))
	assert.False(t, ok)
	assert.Equal(t, 2*time.Second, retryAfter)

	clock.Advance(time.Second)
	ok, retryAfter = limiter.Allow(caller("caller", limit))
	assert.False(t, ok)
	assert.Equal(t, time.Second, retryAfter)

	clock.Advance(time.Second)
	ok, _ = limiter.Allow(caller("caller", limit))
	assert.True(t, ok)

	// The bucket never holds more than the burst.
	clock.Advance(time.Hour)
	for i := 0; i < 3; i++ {
		ok, _ = limiter.Allow(caller("caller", limit))
		assert.True(t, ok)
	}
	ok, _ = limiter.Allow(caller("caller", limit))
	assert.False(t, ok)
}

func TestAllowCallersAreIndependent(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now})
	limit := Limit{RequestsPerMinute: 30, Burst: 1}

	ok, _ := limiter.Allow(caller("a", limit))
	assert.True(t, ok)
	ok, _ = limiter.Allow(caller("a", limit))
	assert.False(t, ok)
	ok, _ = limiter.Allow(caller("b", limit))
	assert.True(t, ok)
}

func TestAllowDisabledLimit(t *testing.T) {
	limiter := New(Options{Now: newClock().Now})

	for _, limit := range []Limit{{}, {RequestsPerMinute: 0, Burst: 1}, {RequestsPerMinute: -1, Burst: 1}} {
		for i := 0; i < 100; i++ {
			ok, retryAfter := limiter.Allow(caller("caller", limit))
			assert.True(t, ok)
			assert.Zero(t, retryAfter)
		}
	}
	assert.Zero(t, limiter.Len(), "a disabled limit keeps no state")
}

func TestAllowZeroBurstMeansOne(t *testing.T) {
	limiter := New(Options{Now: newClock().Now})
	limit := Limit{RequestsPerMinute: 60}

	ok, _ := limiter.Allow(caller("caller", limit))
	assert.True(t, ok)
	ok, retryAfter := limiter.Allow(caller("caller", limit))
	assert.False(t, ok)
	assert.Equal(t, time.Second, retryAfter)
}

func TestAllowLimitChangeApplies(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now})

	ok, _ := limiter.Allow(caller("caller", Limit{RequestsPerMinute: 30, Burst: 1}))
	assert.True(t, ok)
	ok, _ = limiter.Allow(caller("caller", Limit{RequestsPerMinute: 30, Burst: 1}))
	assert.False(t, ok)

	// A higher rate fills the bucket faster from the same state.
	clock.Advance(100 * time.Millisecond)
	ok, _ = limiter.Allow(caller("caller", Limit{RequestsPerMinute: 600, Burst: 1}))
	assert.True(t, ok)

	// A smaller burst caps a bucket that holds 4 tokens: 1 request passes, not 4.
	clock.Advance(time.Hour)
	ok, _ = limiter.Allow(caller("other", Limit{RequestsPerMinute: 60, Burst: 5}))
	assert.True(t, ok)
	ok, _ = limiter.Allow(caller("other", Limit{RequestsPerMinute: 60, Burst: 1}))
	assert.True(t, ok)
	ok, _ = limiter.Allow(caller("other", Limit{RequestsPerMinute: 60, Burst: 1}))
	assert.False(t, ok)
}

func TestIdleCallersLeave(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now, IdleTTL: 5 * time.Minute})
	limit := Limit{RequestsPerMinute: 30, Burst: 10}

	for i := 0; i < 50; i++ {
		limiter.Allow(caller(fmt.Sprintf("caller-%d", i), limit))
	}
	assert.Equal(t, 50, limiter.Len())

	clock.Advance(6 * time.Minute)
	limiter.Allow(caller("active", limit))
	assert.Equal(t, 1, limiter.Len())
}

// When the map is full, an unseen key goes to the shared overflow bucket. No caller
// leaves the map, no caller loses tokens, and the unseen keys get no full bucket each.
func TestFullMapSendsUnseenKeysToTheOverflowBucket(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now, MaxBuckets: 10})
	limit := Limit{RequestsPerMinute: 1, Burst: 3}

	// Each of the 10 callers uses 2 of its 3 tokens.
	for i := 0; i < 10; i++ {
		for j := 0; j < 2; j++ {
			ok, _ := limiter.Allow(caller(fmt.Sprintf("caller-%d", i), limit))
			require.True(t, ok)
		}
	}
	require.Equal(t, 10, limiter.Len())

	// 100 rotated keys share the 3 tokens of one overflow bucket.
	allowed := 0
	for i := 0; i < 100; i++ {
		if ok, _ := limiter.Allow(caller(fmt.Sprintf("rotated-%d", i), limit)); ok {
			allowed++
		}
	}
	assert.Equal(t, 3, allowed)
	assert.Equal(t, 10, limiter.Len(), "the map size must not change")

	// Each existing caller has exactly its 1 token left: nobody left the map and came back full.
	for i := 0; i < 10; i++ {
		ok, _ := limiter.Allow(caller(fmt.Sprintf("caller-%d", i), limit))
		assert.True(t, ok, "caller-%d keeps its last token", i)
		ok, _ = limiter.Allow(caller(fmt.Sprintf("caller-%d", i), limit))
		assert.False(t, ok, "caller-%d did not get a new bucket", i)
	}

	// Each scope has its own overflow bucket.
	ok, _ := limiter.Allow(Check{Scope: "test:other", Key: "x", Limit: limit})
	assert.True(t, ok)
}

func TestADeniedCallTakesNoTokenAndMakesNoBucket(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now})

	wide := Check{Scope: "test:deployment", Limit: Limit{RequestsPerMinute: 60, Burst: 3}}
	narrow := func(key string) Check {
		return Check{Scope: "test:caller", Key: key, Limit: Limit{RequestsPerMinute: 30, Burst: 1}}
	}

	ok, _ := limiter.Allow(wide, narrow("a"))
	assert.True(t, ok)

	// The inner bucket denies, many times. The outer bucket loses no token.
	for i := 0; i < 10; i++ {
		ok, retryAfter := limiter.Allow(wide, narrow("a"))
		assert.False(t, ok)
		assert.Equal(t, 2*time.Second, retryAfter, "the retry time comes from the bucket that denied")
	}

	// The outer bucket has its 2 other tokens for 2 other callers.
	ok, _ = limiter.Allow(wide, narrow("b"))
	assert.True(t, ok)
	ok, _ = limiter.Allow(wide, narrow("c"))
	assert.True(t, ok)

	// The outer bucket is empty now. The denial makes no bucket for the inner check.
	before := limiter.Len()
	ok, retryAfter := limiter.Allow(wide, narrow("never-seen"))
	assert.False(t, ok)
	assert.Equal(t, time.Second, retryAfter)
	assert.Equal(t, before, limiter.Len(), "a denied request allocates nothing")

	// A check with no limit is skipped.
	ok, _ = limiter.Allow(Check{Scope: "test:off", Limit: Limit{}})
	assert.True(t, ok)
	assert.Equal(t, before, limiter.Len())
}

func TestAllowNTakesTheCostFromEachBucket(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now})

	wide := Check{Scope: "test:deployment", Limit: Limit{RequestsPerMinute: 60, Burst: 10}}
	narrow := Check{Scope: "test:caller", Key: "a", Limit: Limit{RequestsPerMinute: 60, Burst: 5}}

	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(3, wide, narrow))

	// The caller has 2 tokens. A cost of 3 must wait 1 second for the third token.
	assert.Equal(t, Result{RetryAfter: time.Second}, limiter.AllowN(3, wide, narrow))
	// The denied call took nothing: a cost of 2 passes, and the deployment has 10 - 3 - 2 = 5.
	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(2, wide, narrow))
	other := Check{Scope: "test:caller", Key: "b", Limit: narrow.Limit}
	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(5, wide, other))
	assert.Equal(t, Result{RetryAfter: time.Second}, limiter.AllowN(1, wide, Check{Scope: "test:caller", Key: "c", Limit: narrow.Limit}))

	// A cost below 1 means 1.
	clock.Advance(time.Second)
	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(0, wide, Check{Scope: "test:caller", Key: "c", Limit: narrow.Limit}))
	assert.Equal(t, Result{RetryAfter: time.Second}, limiter.AllowN(-4, wide, Check{Scope: "test:caller", Key: "c", Limit: narrow.Limit}))
}

// A cost above the burst can never pass. The limiter says so, takes nothing, and
// gives no retry time, so the caller can answer with an error that is not "try again".
func TestAllowNCostAboveTheBurstIsTooLarge(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now})

	wide := Check{Scope: "test:deployment", Limit: Limit{RequestsPerMinute: 60, Burst: 50}}
	narrow := Check{Scope: "test:caller", Key: "a", Limit: Limit{RequestsPerMinute: 60, Burst: 10}}

	maxCost, limited := MaxCost(wide, narrow)
	assert.True(t, limited)
	assert.Equal(t, 10, maxCost, "the smallest burst")

	assert.Equal(t, Result{TooLarge: true}, limiter.AllowN(11, wide, narrow))
	assert.Zero(t, limiter.Len(), "a call that is too large makes no bucket")
	clock.Advance(time.Hour)
	assert.Equal(t, Result{TooLarge: true}, limiter.AllowN(11, wide, narrow), "time does not help")

	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(10, wide, narrow), "a cost equal to the burst passes")

	// No limit: each cost passes.
	_, limited = MaxCost(Check{Scope: "test:off"})
	assert.False(t, limited)
	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(100000, Check{Scope: "test:off"}))
	assert.Equal(t, Result{Allowed: true}, limiter.AllowN(100000))
}

// A sweep that a call with a fast limit starts must not drop a bucket of a slow limit
// that is not full yet: the bucket would come back full.
func TestSweepKeepsABucketUntilItsOwnFillTime(t *testing.T) {
	clock := newClock()
	limiter := New(Options{Now: clock.Now, IdleTTL: time.Minute})

	slow := Check{Scope: "test:slow", Key: "s", Limit: Limit{RequestsPerMinute: 1, Burst: 30}} // 30 minutes to fill
	fast := Check{Scope: "test:fast", Key: "f", Limit: Limit{RequestsPerMinute: 600, Burst: 1}}

	for i := 0; i < 30; i++ {
		ok, _ := limiter.Allow(slow)
		require.True(t, ok)
	}

	// 10 minutes later, a fast call starts a sweep. The idle TTL is over, the fill time is not.
	clock.Advance(10 * time.Minute)
	limiter.Allow(fast)
	require.Equal(t, 2, limiter.Len())

	allowed := 0
	for i := 0; i < 30; i++ {
		if ok, _ := limiter.Allow(slow); ok {
			allowed++
		}
	}
	assert.Equal(t, 10, allowed, "the slow bucket has the 10 tokens of 10 minutes, not a full burst")

	// After its own fill time, the slow bucket can leave.
	clock.Advance(31 * time.Minute)
	limiter.Allow(fast)
	assert.Equal(t, 1, limiter.Len())
}

func TestAllowIsSafeForConcurrentUse(t *testing.T) {
	clock := newClock() // The clock does not move, so no bucket gets a new token.
	limiter := New(Options{Now: clock.Now})

	const goroutines, requests = 16, 50
	shared := Check{Scope: "test:shared", Limit: Limit{RequestsPerMinute: 1, Burst: 100}}
	own := func(g int) Check {
		return Check{Scope: "test:own", Key: fmt.Sprintf("g-%d", g), Limit: Limit{RequestsPerMinute: 1, Burst: 20}}
	}

	var sharedAllowed, ownAllowed atomic.Int64
	var wg sync.WaitGroup
	for g := 0; g < goroutines; g++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < requests; i++ {
				if ok, _ := limiter.Allow(shared); ok {
					sharedAllowed.Add(1)
				}
				if ok, _ := limiter.Allow(own(g)); ok {
					ownAllowed.Add(1)
				}
			}
		}()
	}
	wg.Wait()

	assert.Equal(t, int64(100), sharedAllowed.Load(), "the shared bucket gives exactly its burst")
	assert.Equal(t, int64(goroutines*20), ownAllowed.Load(), "each own bucket gives exactly its burst")
	assert.Equal(t, goroutines+1, limiter.Len())
}

func TestAllowWithNoChecks(t *testing.T) {
	limiter := New(Options{Now: newClock().Now})

	ok, retryAfter := limiter.Allow()
	assert.True(t, ok)
	assert.Zero(t, retryAfter)

	ok, _ = limiter.Allow([]Check(nil)...)
	assert.True(t, ok)
	assert.Zero(t, limiter.Len())
}

// The clock moves while the goroutines run, so refill, sweep, and take interleave.
// The total can never be above the burst plus the refill of the elapsed time.
func TestAllowIsSafeForConcurrentUseWithAMovingClock(t *testing.T) {
	start := time.Date(2026, time.September, 20, 12, 0, 0, 0, time.UTC)
	var elapsed atomic.Int64
	limiter := New(Options{
		Now:     func() time.Time { return start.Add(time.Duration(elapsed.Load())) },
		IdleTTL: time.Second,
	})

	const goroutines, requests = 16, 200
	const step = 100 * time.Millisecond
	shared := Check{Scope: "test:shared", Limit: Limit{RequestsPerMinute: 600, Burst: 50}} // 10 each second

	var allowed atomic.Int64
	var wg sync.WaitGroup
	for g := 0; g < goroutines; g++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < requests; i++ {
				elapsed.Add(int64(step))
				if ok, _ := limiter.Allow(shared, Check{Scope: "test:own", Key: fmt.Sprintf("g-%d-%d", g, i%7), Limit: Limit{RequestsPerMinute: 6000, Burst: 100}}); ok {
					allowed.Add(1)
				}
			}
		}()
	}
	wg.Wait()

	total := time.Duration(elapsed.Load())
	require.Equal(t, time.Duration(goroutines*requests)*step, total)
	upperBound := int64(50 + 10*total.Seconds())
	assert.LessOrEqual(t, allowed.Load(), upperBound, "never more than the burst plus the refill")
	assert.Greater(t, allowed.Load(), int64(50), "the refill gives tokens while the clock moves")
}
