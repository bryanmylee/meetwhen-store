import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import * as functions from 'firebase-functions';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import Container from 'typedi';
import { AuthResolver } from './auth/resolver';
import { AuthService } from './auth/service';
import { MeetingResolver } from './meeting/resolver';
import { ScheduleResolver } from './schedule/resolver';
import { UserResolver } from './user/resolver';

const configureServer = async () => {
  const app = express();
  app.use(cors());
  app.use(cookieParser())

  const schema = await buildSchema({
    resolvers: [AuthResolver, UserResolver, MeetingResolver, ScheduleResolver],
    container: Container,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ res, req }) => {
      Container.get(AuthService).verifyIdToken(req);
      return {
        res,
        req,
        user: {
          name: 'Bryan'
        },
      };
    },
  });

  apolloServer.applyMiddleware({ app });

  return app;
};

const server = configureServer();

export const api = functions.region('asia-east2').https.onRequest(async (...args) => {
  const app = await server;
  return app(...args);
});
