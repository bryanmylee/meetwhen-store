import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
import { auth } from 'firebase-admin';
import { firebaseAdmin } from '../firebase/setup';

export type Principal = auth.DecodedIdToken | null;
export type Context = ExpressContext & { principal: Principal };

/**
 * The `context` function generates the context that is exposed to Resolver methods with @Ctx. It
 * is passed as a configuration option when initializing ApolloServer.
 *
 * `context` is used to verify any JWT cookies on the server request and populate the `principal`
 * property.
 */
export const context: ContextFunction<ExpressContext, unknown> = async ({ req, res }) => {
  try {
    const principal: Principal = await firebaseAdmin.auth().verifyIdToken(req.cookies.__session);
    return { req, res, principal } as Context;
  } catch (error) {
    return { req, res, principal: null } as Context;
  }
};
