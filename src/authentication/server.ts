import oauth2orize, { OAuth2Server } from 'oauth2orize';
import bodyParser = require('body-parser');
import { Server } from 'http';
import express = require('express');
import { Application } from 'express';

export interface AuthenticationApp {
  start(port: number): void;
  stop(): void;
  getApp(): Application;
}

export class AuthenticationAppImpl implements AuthenticationApp {
  private app: Application;
  private server: Server;
  constructor() {
    this.app = this.createApp();
  }
  private createApp(): Application {
    const app = express();
    let server = oauth2orize.createServer();
    server = this.setupServer(server);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.post('/login', (req, res) => {
      res.sendStatus(200);
    });

    return app;
  }
  setupServer(server: OAuth2Server): oauth2orize.OAuth2Server {
    server.serializeClient((client, done) => done(null, client.id));

    server.deserializeClient((id, done) => {
      done(null, { id: 1 });
    });

    server.grant(
      oauth2orize.grant.code((_client, _redirectUri, _user, _ares, done) => {
        const code = '12341234';
        done(null, code);
      })
    );

    server.grant(
      oauth2orize.grant.token((client, user, ares, done) => {
        const token = 'someToken';
        return done(null, token);
      })
    );

    server.exchange(
      oauth2orize.exchange.clientCredentials((client, scope, done) => {
        // Validate the client
        return done(null, 'someToken');
      })
    );

    return server;
  }
  async start(port: number) {
    this.server = await this.app.listen(port);
  }
  async stop() {
    return this.server.close();
  }
  getApp() {
    return this.app;
  }
}