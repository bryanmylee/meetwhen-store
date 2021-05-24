import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as functions from 'firebase-functions';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import Container from 'typedi';
import { MeetingResolver } from './meeting/resolver';
import { ScheduleResolver } from './schedule/resolver';
import { authChecker } from './security/auth-checker';
import { context } from './security/context';
import { UserResolver } from './user/resolver';

const configureServer = async () => {
  const schema = await buildSchema({
    authChecker,
    resolvers: [UserResolver, MeetingResolver, ScheduleResolver],
    container: Container,
  });

  const apolloServer = new ApolloServer({
    schema,
    context,
  });

  const app = express();

  app.use(cookieParser());

  apolloServer.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: 'http://localhost:3000',
    },
  });

  return app;
};

const server = configureServer();

export const api = functions.region('asia-east2').https.onRequest(async (req, res) => {
  const app = await server;
  app(req, res);
});
