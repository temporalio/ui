import type { Server as HttpServer } from 'http';
import { format } from 'node:url';

import express, { type Application } from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import Provider from 'oidc-provider';

/**
 * Options for configuring the OIDCServer.
 */
export interface OIDCServerOptions {
  issuer: string;
  port: number;
  viewsPath: string;
  providerConfiguration: Record<string, unknown> & {
    findAccount?: (
      ctx: unknown,
      id: string,
      token?: unknown,
    ) => Promise<unknown>;
  };
  accountModel: {
    findAccount: (
      ctx: unknown,
      id: string,
      token?: unknown,
    ) => Promise<unknown>;
  };
  routes: (app: Application, provider: Provider) => void;
}

/**
 * OIDCServer encapsulates an Express application and an oidc-provider instance.
 */
export default class OIDCServer {
  public app: Application;
  public provider!: Provider;
  public server?: HttpServer;

  private issuer: string;
  private port: number;
  private viewsPath: string;
  private providerConfiguration: Record<string, unknown> & {
    findAccount?: (
      ctx: unknown,
      id: string,
      token?: unknown,
    ) => Promise<unknown>;
  };
  private accountModel: {
    findAccount: (
      ctx: unknown,
      id: string,
      token?: unknown,
    ) => Promise<unknown>;
  };
  private routes: (app: Application, provider: Provider) => void;

  constructor(options: OIDCServerOptions) {
    this.issuer = options.issuer;
    this.port = options.port;
    this.viewsPath = options.viewsPath;
    this.providerConfiguration = options.providerConfiguration;
    this.accountModel = options.accountModel;
    this.routes = options.routes;
    this.app = express();
  }

  private configureSecurity(): void {
    const directives = contentSecurityPolicy.getDefaultDirectives();
    delete directives['form-action'];
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: false,
          directives,
        },
      }),
    );
  }

  private configureViews(): void {
    this.app.set('views', this.viewsPath);
    this.app.set('view engine', 'ejs');
  }

  private configureProvider(): void {
    // inject account model for findAccount
    this.providerConfiguration.findAccount = this.accountModel.findAccount;
    this.provider = new Provider(this.issuer, this.providerConfiguration);
  }

  private configureRoutes(): void {
    // custom interaction routes
    this.routes(this.app, this.provider);
    // oidc-provider callback for all other endpoints
    this.app.use(this.provider.callback());
  }

  /**
   * Starts the Express server and the oidc-provider instance.
   */
  public async start(): Promise<void> {
    try {
      this.configureSecurity();
      this.configureViews();
      this.configureProvider();
      this.configureRoutes();

      const prod = process.env.NODE_ENV === 'production';
      if (prod) {
        this.app.enable('trust proxy');
        this.provider.proxy = true;
        this.app.use((req, res, next) => {
          if (req.secure) {
            return next();
          }
          if (['GET', 'HEAD'].includes(req.method)) {
            return res.redirect(
              format({
                protocol: 'https',
                host: req.get('host') || '',
                pathname: req.originalUrl,
              }),
            );
          }
          res.status(400).json({
            error: 'invalid_request',
            error_description: 'please use https',
          });
        });
      }

      this.server = this.app.listen(this.port, () => {
        // eslint-disable-next-line no-console
        console.log(
          `OIDC Server listening at http://localhost:${this.port} (issuer: ${this.issuer})`,
        );
      });
    } catch (err) {
      if (this.server?.listening) this.server.close();
      // eslint-disable-next-line no-console
      console.error('Error starting OIDC Server:', err);
      process.exit(1);
    }
  }

  /**
   * Stops the server if it is running.
   */
  public stop(): void {
    if (this.server?.listening) {
      this.server.close();
    }
  }
}
