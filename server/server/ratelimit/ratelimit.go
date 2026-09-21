// Package ratelimit is a small in-memory token bucket limiter.
//
// A caller of Allow gives a list of checks. Each check names a bucket (a scope and a
// key) and the limit of that bucket. The limit goes in with each call, so a config
// reload changes the limit without a restart. Several endpoints can share one
// Limiter: the scope keeps their buckets apart, or joins them when they use the
// same scope on purpose (for example, one quota for a deployment).
//
// The number of buckets in memory has a bound. When the map is full, an unseen key
// gets no bucket of its own: it uses one shared overflow bucket for its scope. Thus a
// caller that rotates keys cannot push out the bucket of another caller, cannot get
// a full bucket for each new key, and cannot make the limiter scan the map.
package ratelimit

import (
	"math"
	"sync"
	"time"
)

const (
	// DefaultMaxBuckets bounds the number of buckets in memory.
	DefaultMaxBuckets = 10000
	// DefaultIdleTTL is the minimum idle time before a bucket can leave.
	DefaultIdleTTL = 10 * time.Minute

	sweepInterval = time.Minute
)

// Limit is the limit of one bucket.
type Limit struct {
	// RequestsPerMinute is the refill rate. Zero or less means no limit.
	RequestsPerMinute int
	// Burst is the bucket size. A value below 1 means 1.
	Burst int
}

// Enabled reports whether the limit is on.
func (l Limit) Enabled() bool {
	return l.RequestsPerMinute > 0
}

// Check names one bucket and its limit.
type Check struct {
	// Scope is the kind of the bucket, such as "nl-search:caller". Code defines the
	// scopes, so there are few of them. Each scope has its own overflow bucket.
	Scope string
	// Key identifies the bucket in the scope, such as a token hash or an IP. It can
	// be empty for a scope with one bucket.
	Key   string
	Limit Limit
}

// Options configures a Limiter. The zero value of each field selects its default.
type Options struct {
	MaxBuckets int
	IdleTTL    time.Duration
	// Now is the clock. Tests inject one.
	Now func() time.Time
}

type bucketKey struct {
	scope string
	key   string
}

type bucket struct {
	tokens float64
	last   time.Time
	// fillTime is the time that this bucket needs to fill from empty, from the limit
	// of its most recent check. A sweep keeps the bucket at least that long, so a
	// sweep that a fast limit starts cannot drop a bucket of a slow limit before it is full.
	fillTime time.Duration
}

// Limiter holds the token buckets. It is safe for concurrent use.
type Limiter struct {
	mu         sync.Mutex
	buckets    map[bucketKey]*bucket
	overflow   map[string]*bucket
	maxBuckets int
	idleTTL    time.Duration
	now        func() time.Time
	lastSweep  time.Time
}

// New creates a Limiter.
func New(opts Options) *Limiter {
	l := &Limiter{
		buckets:    map[bucketKey]*bucket{},
		overflow:   map[string]*bucket{},
		maxBuckets: opts.MaxBuckets,
		idleTTL:    opts.IdleTTL,
		now:        opts.Now,
	}
	if l.maxBuckets <= 0 {
		l.maxBuckets = DefaultMaxBuckets
	}
	if l.idleTTL <= 0 {
		l.idleTTL = DefaultIdleTTL
	}
	if l.now == nil {
		l.now = time.Now
	}
	return l
}

// Result is the answer of the limiter for one call.
type Result struct {
	Allowed bool
	// RetryAfter is the time until the bucket that denied has enough tokens.
	RetryAfter time.Duration
	// TooLarge says that the cost is above the burst of a check. Such a call can
	// never pass, at any time, so a caller must not tell its client to try again.
	TooLarge bool
}

// Allow is AllowN with a cost of 1.
func (l *Limiter) Allow(checks ...Check) (bool, time.Duration) {
	result := l.AllowN(1, checks...)
	return result.Allowed, result.RetryAfter
}

// MaxCost gives the largest cost that can pass the checks: the smallest burst of the
// checks that have a limit. The second value is false when no check has a limit.
func MaxCost(checks ...Check) (int, bool) {
	maxCost, limited := 0, false
	for _, check := range checks {
		if !check.Limit.Enabled() {
			continue
		}
		if burst := max(check.Limit.Burst, 1); !limited || burst < maxCost {
			maxCost, limited = burst, true
		}
	}
	return maxCost, limited
}

// AllowN takes cost tokens from the bucket of each check, or takes nothing. A cost
// below 1 means 1. Use a cost above 1 for a call that makes several paid requests.
//
// It looks at the checks in order, and the first bucket that has too few tokens
// denies the call: RetryAfter comes from that bucket. The limiter takes the tokens
// only after all the checks pass, so a denied call uses no token of an outer (wider)
// bucket and makes no bucket. That matters for a cost above 1: a caller that is at its
// own limit cannot drain the shared quota of the deployment with large denied calls.
func (l *Limiter) AllowN(cost int, checks ...Check) Result {
	cost = max(cost, 1)

	// A disabled limit gives no checks: it must not wait for the mutex.
	maxCost, limited := MaxCost(checks...)
	if !limited {
		return Result{Allowed: true}
	}
	if cost > maxCost {
		return Result{TooLarge: true}
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	l.sweep(now)

	// Phase 1: look, and change nothing.
	for _, check := range checks {
		if !check.Limit.Enabled() {
			continue
		}
		burst, perSecond := rates(check.Limit)
		tokens := burst
		if b, found := l.find(check); found {
			tokens = b.refilled(now, burst, perSecond)
		}
		if tokens < float64(cost) {
			return Result{RetryAfter: time.Duration((float64(cost) - tokens) / perSecond * float64(time.Second))}
		}
	}

	// Phase 2: take.
	for _, check := range checks {
		if !check.Limit.Enabled() {
			continue
		}
		burst, perSecond := rates(check.Limit)
		b := l.findOrCreate(now, check, burst)
		// The floor covers one rare case: the map became full in this loop, and a new key
		// of a later check got the overflow bucket in place of the full bucket of phase 1.
		b.tokens = math.Max(b.refilled(now, burst, perSecond)-float64(cost), 0)
		b.last = now
		b.fillTime = time.Duration(burst / perSecond * float64(time.Second))
	}

	return Result{Allowed: true}
}

func rates(limit Limit) (burst, perSecond float64) {
	return float64(max(limit.Burst, 1)), float64(limit.RequestsPerMinute) / 60
}

// refilled gives the tokens of the bucket at the given time. It does not change the
// bucket. The cap also applies a smaller burst after a config reload.
func (b *bucket) refilled(now time.Time, burst, perSecond float64) float64 {
	tokens := b.tokens
	if elapsed := now.Sub(b.last); elapsed > 0 {
		tokens += elapsed.Seconds() * perSecond
	}
	return math.Min(tokens, burst)
}

// find gives the bucket that the check uses now, and changes nothing. It costs O(1):
// when the map is full, an unseen key uses the overflow bucket of its scope. It is
// false when the check has no bucket yet, which means a full bucket.
func (l *Limiter) find(check Check) (*bucket, bool) {
	if b, found := l.buckets[bucketKey{scope: check.Scope, key: check.Key}]; found {
		return b, true
	}
	if len(l.buckets) < l.maxBuckets {
		return nil, false
	}
	b, found := l.overflow[check.Scope]
	return b, found
}

// findOrCreate is find, and it makes a full bucket when the check has none. When the
// map is full, nothing leaves the map: the new bucket is the overflow bucket of the scope.
func (l *Limiter) findOrCreate(now time.Time, check Check, burst float64) *bucket {
	if b, found := l.find(check); found {
		return b
	}

	b := &bucket{tokens: burst, last: now}
	if len(l.buckets) < l.maxBuckets {
		l.buckets[bucketKey{scope: check.Scope, key: check.Key}] = b
	} else {
		l.overflow[check.Scope] = b
	}
	return b
}

// Len gives the number of buckets in the map. The overflow buckets are not in the map.
func (l *Limiter) Len() int {
	l.mu.Lock()
	defer l.mu.Unlock()
	return len(l.buckets)
}

// sweep removes the idle buckets, at most one time for each sweep interval. A bucket
// leaves only after it was idle for its own fill time, so it is full and its removal
// loses no state.
func (l *Limiter) sweep(now time.Time) {
	if now.Sub(l.lastSweep) < sweepInterval {
		return
	}
	l.lastSweep = now

	for key, b := range l.buckets {
		if now.Sub(b.last) >= max(l.idleTTL, b.fillTime) {
			delete(l.buckets, key)
		}
	}
}
