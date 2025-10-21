import { strict as assert } from 'node:assert';
import * as querystring from 'node:querystring';
import { inspect } from 'node:util';

import {
  type Application,
  type NextFunction,
  type Request,
  type Response,
  urlencoded,
} from 'express';
import isEmpty from 'lodash/isEmpty.js';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';

import Account from '../support/account';

const body = urlencoded({ extended: false });
const keys = new Set<string>();
const debug = (obj: Record<string, unknown>): string =>
  querystring.stringify(
    Object.entries(obj).reduce(
      (acc, [key, value]) => {
        keys.add(key);
        if (isEmpty(value)) return acc;
        acc[key] = inspect(value, { depth: null });
        return acc;
      },
      {} as Record<string, string>,
    ),
    '<br/>',
    ': ',
    {
      encodeURIComponent(value: string) {
        return keys.has(value) ? `<strong>${value}</strong>` : value;
      },
    },
  );
const { SessionNotFound } = errors;

/**
 * Registers interaction routes into the Express app.
 */
export default function registerRoutes(
  app: Application,
  provider: Provider,
): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const orig = res.render.bind(res);
    res.render = ((view: string, locals?: Record<string, unknown>) => {
      app.render(view, locals || {}, (err, html) => {
        if (err) throw err;
        orig('_layout', {
          ...locals,
          body: html,
        });
      });
    }) as typeof res.render;
    next();
  });

  function setNoCache(req: Request, res: Response, next: NextFunction): void {
    res.set('cache-control', 'no-store');
    next();
  }

  app.get(
    '/interaction/:uid',
    setNoCache,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { uid, prompt, params, session } =
          await provider.interactionDetails(req, res);
        const client = await provider.Client.find(params.client_id as string);
        switch (prompt.name) {
          case 'login':
            return res.render('login', {
              client,
              uid,
              details: prompt.details,
              params,
              title: 'Sign-in',
              session: session
                ? debug(session as Record<string, unknown>)
                : undefined,
              dbg: {
                params: debug(params as Record<string, unknown>),
                prompt: debug(prompt as Record<string, unknown>),
              },
            });
          case 'consent':
            return res.render('interaction', {
              client,
              uid,
              details: prompt.details,
              params,
              title: 'Authorize',
              session: session
                ? debug(session as Record<string, unknown>)
                : undefined,
              dbg: {
                params: debug(params as Record<string, unknown>),
                prompt: debug(prompt as Record<string, unknown>),
              },
            });
          default:
            return;
        }
      } catch (err) {
        next(err as Error);
      }
    },
  );

  app.post(
    '/interaction/:uid/login',
    setNoCache,
    body,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          prompt: { name },
        } = await provider.interactionDetails(req, res);
        assert.equal(name, 'login');
        const { login } = req.body as { login: string };
        const account = await Account.findByLogin(login);
        const result = { login: { accountId: account.accountId } };
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: false,
        });
      } catch (err) {
        next(err as Error);
      }
    },
  );

  app.post(
    '/interaction/:uid/confirm',
    setNoCache,
    body,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const interactionDetails = await provider.interactionDetails(req, res);
        const {
          prompt: { name, details },
          params,
          session: { accountId },
        } = interactionDetails;
        assert.equal(name, 'consent');
        let { grantId } = interactionDetails;
        let grant;
        if (grantId) {
          grant = await provider.Grant.find(grantId as string);
        } else {
          grant = new provider.Grant({
            accountId: accountId as string,
            clientId: params.client_id as string,
          });
        }
        if (details.missingOIDCScope) {
          grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims as string[]);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes as Record<string, string[]>,
          )) {
            grant.addResourceScope(indicator, scopes.join(' '));
          }
        }
        grantId = await grant.save();
        const consent: Record<string, unknown> = {};
        if (!interactionDetails.grantId) consent.grantId = grantId;
        const result = { consent };
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: true,
        });
      } catch (err) {
        next(err as Error);
      }
    },
  );

  app.get(
    '/interaction/:uid/abort',
    setNoCache,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = {
          error: 'access_denied',
          error_description: 'End-User aborted interaction',
        };
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: false,
        });
      } catch (err) {
        next(err as Error);
      }
    },
  );

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SessionNotFound) {
      // handle interaction expired / session not found error
    }
    next(err);
  });
}
