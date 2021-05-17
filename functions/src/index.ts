import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import * as functions from 'firebase-functions';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import Container from 'typedi';
import { MeetingResolver } from './meeting/resolver';
import { ScheduleResolver } from './schedule/resolver';
import { UserResolver } from './user/resolver';
import { authController } from './auth/controller';

const configureServer = async () => {
  const app = express();
  app.use(cors());
  app.use(authController);

  const schema = await buildSchema({
    resolvers: [UserResolver, MeetingResolver, ScheduleResolver],
    container: Container,
  });

  const apolloServer = new ApolloServer({ schema });

  apolloServer.applyMiddleware({ app });

  return app;
};

const server = configureServer();

export const api = functions.region('asia-east2').https.onRequest(async (...args) => {
  const app = await server;
  return app(...args);
});
