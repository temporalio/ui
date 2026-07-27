// =============================================================================
// ⚠️  FOR LOCAL DEVELOPMENT AND TESTING ONLY - Contains hardcoded secrets
// =============================================================================
//
// Token Lifetime Configuration (for testing)
//
// These values are intentionally SHORT for testing refresh token flows.
// In production, your OIDC provider will determine these lifetimes.
//
// Current settings:
// - Access Token: 60 seconds (forces refresh on every test)
// - ID Token: 60 seconds
// - Refresh Token: 86400 seconds (24 hours)
// - Session: 120 seconds (2 minutes) - matches maxSessionDuration in with-auth.yaml
//
// The Go server's refresh cookie MaxAge will automatically match
// the RefreshToken TTL from the IdP.
//
// Testing Scenarios:
//   1. Token Refresh: AccessToken/IdToken TTL (60s) < maxSessionDuration (2m)
//      This forces the UI to refresh tokens before the session expires.
//   2. Session Expiry: Session TTL (120s) matches maxSessionDuration (2m).
//      When the session expires, the user must re-enter credentials here.
//   3. Long Sessions: Increase Session TTL and maxSessionDuration together.
//      RefreshToken TTL (1 day) allows long-lived sessions with short tokens.
//
// Key relationships:
//   - AccessToken TTL < maxSessionDuration: Enables token refresh testing
//   - Session TTL = maxSessionDuration: Forces re-auth at OIDC on session end
//   - RefreshToken TTL > Session TTL: Allows refresh within session lifetime
// =============================================================================
const configuration: Record<string, unknown> = {
  conformIdTokenClaims: false,
  ttl: {
    AccessToken: 60, // 1 minute - forces refresh before session expires
    IdToken: 60, // 1 minute - same as access token
    RefreshToken: 60 * 60 * 24, // 1 day - allows refresh throughout session
    Session: 120, // 2 minutes - matches maxSessionDuration in with-auth.yaml
    Interaction: 120, // 2 minutes - OIDC interaction timeout
    Grant: 120, // 2 minutes - OIDC grant timeout
  },
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  issueRefreshToken: async () => {
    return true;
  },
  clients: [
    {
      client_id: 'temporal-ui',
      client_secret: 'temporal-secret',
      grant_types: ['authorization_code', 'refresh_token'],
      redirect_uris: ['http://localhost:8081/auth/sso/callback'],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_basic',
    },
  ],
  interactions: {
    url(_ctx: unknown, interaction: { uid: string }): string {
      return `/interaction/${interaction.uid}`;
    },
  },
  claims: {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
    ],
  },
  features: {
    devInteractions: { enabled: false },
    deviceFlow: { enabled: true },
    revocation: { enabled: true },
  },
  jwks: {
    keys: [
      {
        d: 'VEZOsY07JTFzGTqv6cC2Y32vsfChind2I_TTuvV225_-0zrSej3XLRg8iE_u0-3GSgiGi4WImmTwmEgLo4Qp3uEcxCYbt4NMJC7fwT2i3dfRZjtZ4yJwFl0SIj8TgfQ8ptwZbFZUlcHGXZIr4nL8GXyQT0CK8wy4COfmymHrrUoyfZA154ql_OsoiupSUCRcKVvZj2JHL2KILsq_sh_l7g2dqAN8D7jYfJ58MkqlknBMa2-zi5I0-1JUOwztVNml_zGrp27UbEU60RqV3GHjoqwI6m01U7K0a8Q_SQAKYGqgepbAYOA-P4_TLl5KC4-WWBZu_rVfwgSENwWNEhw8oQ',
        dp: 'E1Y-SN4bQqX7kP-bNgZ_gEv-pixJ5F_EGocHKfS56jtzRqQdTurrk4jIVpI-ZITA88lWAHxjD-OaoJUh9Jupd_lwD5Si80PyVxOMI2xaGQiF0lbKJfD38Sh8frRpgelZVaK_gm834B6SLfxKdNsP04DsJqGKktODF_fZeaGFPH0',
        dq: 'F90JPxevQYOlAgEH0TUt1-3_hyxY6cfPRU2HQBaahyWrtCWpaOzenKZnvGFZdg-BuLVKjCchq3G_70OLE-XDP_ol0UTJmDTT-WyuJQdEMpt_WFF9yJGoeIu8yohfeLatU-67ukjghJ0s9CBzNE_LrGEV6Cup3FXywpSYZAV3iqc',
        e: 'AQAB',
        kty: 'RSA',
        n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
        p: '5wC6nY6Ev5FqcLPCqn9fC6R9KUuBej6NaAVOKW7GXiOJAq2WrileGKfMc9kIny20zW3uWkRLm-O-3Yzze1zFpxmqvsvCxZ5ERVZ6leiNXSu3tez71ZZwp0O9gys4knjrI-9w46l_vFuRtjL6XEeFfHEZFaNJpz-lcnb3w0okrbM',
        q: '3I1qeEDslZFB8iNfpKAdWtz_Wzm6-jayT_V6aIvhvMj5mnU-Xpj75zLPQSGa9wunMlOoZW9w1wDO1FVuDhwzeOJaTm-Ds0MezeC4U6nVGyyDHb4CUA3ml2tzt4yLrqGYMT7XbADSvuWYADHw79OFjEi4T3s3tJymhaBvy1ulv8M',
        qi: 'wSbXte9PcPtr788e713KHQ4waE26CzoXx-JNOgN0iqJMN6C4_XJEX-cSvCZDf4rh7xpXN6SGLVd5ibIyDJi7bbi5EQ5AXjazPbLBjRthcGXsIuZ3AtQyR0CEWNSdM7EyM5TRdyZQ9kftfz9nI03guW3iKKASETqX2vh0Z8XRjyU',
        use: 'sig',
      },
      {
        crv: 'P-256',
        d: 'K9xfPv773dZR22TVUB80xouzdF7qCg5cWjPjkHyv7Ws',
        kty: 'EC',
        use: 'sig',
        x: 'FWZ9rSkLt6Dx9E3pxLybhdM6xgR5obGsj5_pqmnz5J4',
        y: '_n8G69C-A2Xl4xUW2lF0i8ZGZnk_KPYrhv4GbTGu5G4',
      },
    ],
  },
};

export default configuration;
