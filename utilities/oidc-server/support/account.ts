import { nanoid } from 'nanoid';
import type { AccountClaims, Account as OidcAccount } from 'oidc-provider';

/**
 * Account model for oidc-provider interactions.
 */
export default class Account implements OidcAccount {
  [key: string]: unknown;
  public accountId: string;
  private profile?: Record<string, unknown>;

  constructor(id?: string, profile?: Record<string, unknown>) {
    this.accountId = id ?? nanoid();
    this.profile = profile;
    Account.store.set(this.accountId, this);
  }

  /**
   * Returns claims for the ID token or userinfo endpoint.
   */
  public async claims(): Promise<AccountClaims> {
    if (this.profile) {
      return {
        sub: this.accountId,
        email: this.profile.email,
        email_verified: this.profile.email_verified,
        family_name: this.profile.family_name,
        given_name: this.profile.given_name,
        locale: this.profile.locale,
        name: this.profile.name,
      };
    }
    return {
      sub: this.accountId,
      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000',
      },
      birthdate: '1987-10-16',
      email: 'johndoe@example.com',
      email_verified: false,
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'johnny',
      profile: 'https://johnswebsite.com',
      updated_at: 1454704946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin',
    };
  }

  private static store = new Map<string, Account>();
  private static logins = new Map<string, Account>();

  /**
   * Finds or creates an account for federated logins.
   */
  public static async findByFederated(
    provider: string,
    claims: { sub: string } & Record<string, unknown>,
  ): Promise<Account> {
    const id = `${provider}.${claims.sub}`;
    if (!Account.logins.has(id)) {
      Account.logins.set(id, new Account(id, claims));
    }
    return Account.logins.get(id)!;
  }

  /**
   * Finds or creates an account by login identifier (email).
   * Uses the email as the username and derives the name from the email prefix.
   */
  public static async findByLogin(login: string): Promise<Account> {
    if (!Account.logins.has(login)) {
      const emailPrefix = login.split('@')[0] ?? login;
      const profile = {
        email: login,
        email_verified: true,
        name: emailPrefix,
        given_name: emailPrefix,
        family_name: '',
      };
      Account.logins.set(login, new Account(login, profile));
    }
    return Account.logins.get(login)!;
  }

  /**
   * Finds an account by its accountId.
   */
  public static async findAccount(ctx: unknown, id: string): Promise<Account> {
    if (!Account.store.has(id)) {
      new Account(id);
    }
    return Account.store.get(id)!;
  }
}
