# Architecture Refactor TODO

This document tracks pre-existing security issues that are **out of scope** for the refresh token PR but should be addressed in a future architectural refactor.

## Pre-existing Issues (Not Introduced by Refresh Token PR)

### Critical

1. **Tokens in localStorage (XSS Vulnerability)**

   - **Location**: `src/lib/stores/auth-user.ts` uses `persistStore`
   - **Risk**: Any XSS vulnerability allows token theft
   - **Fix**: Implement BFF pattern with server-side session storage
   - **Effort**: 5-7 days (Option B from refresh-token-security-roadmap.md)

2. **Non-HttpOnly User Cookies**

   - **Location**: `server/server/auth/auth.go:93` sets `HttpOnly: false`
   - **Risk**: JavaScript can read access tokens from cookies
   - **Fix**: Server-side session storage (tokens never sent to browser)
   - **Effort**: Included in BFF refactor

3. **No Encryption (Base64 Only)**
   - **Location**: `server/server/auth/auth.go:84` uses base64 encoding
   - **Risk**: Tokens readable if cookies intercepted
   - **Fix**: AES-256-GCM encryption for cookies, or BFF pattern
   - **Effort**: 1 day (encryption) or included in BFF

### High

4. **Confidential Client Pattern Misuse**

   - **Issue**: Backend acts as confidential OAuth2 client but exposes tokens to browser
   - **Fix**: True BFF implementation (browser never sees tokens)
   - **Effort**: Included in BFF refactor

5. **No Token Rotation**
   - **Issue**: Refresh tokens are reused (no single-use rotation)
   - **Fix**: Requires server-side session storage for reuse detection
   - **Effort**: Included in BFF refactor

### Medium

6. **No Server-Side Revocation**
   - **Issue**: Can't revoke tokens server-side (only via logout cookie clearing)
   - **Fix**: Session store with revocation API
   - **Effort**: Included in BFF refactor

## Recommended Refactor Path

See `SECURITY_REFACTOR_PLAN.md` for detailed implementation guide:

- **Option B (Recommended)**: BFF pattern with server-side session storage

  - Effort: 5-7 days
  - Benefits: Addresses all critical issues, no external dependencies
  - Scaling: Use sticky sessions or file-based storage for multi-instance deployments

## References

- Implementation guide: `SECURITY_REFACTOR_PLAN.md`
- Authentication docs: `AUTHENTICATION.md`
- RFC 9700: https://datatracker.ietf.org/doc/rfc9700/
