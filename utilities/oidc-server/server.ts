import type { Server as HttpServer } from 'http';

import express, { type Application } from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import Provider, { type Account, type Configuration } from 'oidc-provider';

/**
 * Options for configuring the OIDCServer.
 */
export interface OIDCServerOptions {
  issuer: string;
  port: number;
  viewsPath: string;
  providerConfiguration: Partial<Configuration>;
  accountModel: {
    findAccount: (
      ctx: unknown,
      id: string,
      token?: unknown,
    ) => Promise<Account>;
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
  private providerConfiguration: Partial<Configuration>;
  private accountModel: {
    findAccount: (
      ctx: unknown,
      id: string,
      token?: unknown,
    ) => Promise<Account>;
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
    // remove default form-action to allow form submissions
    delete directives['form-action'];
    // allow Tailwind CDN and inline scripts for dynamic CSS
    directives['script-src'] = [
      ...((directives['script-src'] as string[]) || []),
      'https://cdn.tailwindcss.com',
      "'unsafe-inline'",
    ];
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

      this.server = this.app.listen(this.port);
    } catch (err) {
      if (this.server?.listening) this.server.close();
      console.error('Error starting OIDC Server:', err);
      process.exit(1);
    }
  }

  /**
   * Stops the server if it is running.
   */
  public stop(): void {
    if (this.server?.listening) {
      console.log('Stopping OIDC Server...');
      this.server.close();
    }
  }
}
