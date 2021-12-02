import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
import { firebaseAdmin } from '../firebase/setup';
import { UserShallow } from '../user/types';

export type Principal = UserShallow | null;
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
    const sessionCookie = getSessionCookieFromBearer(req.headers.authorization) ?? '';
    const decodedIdToken = await firebaseAdmin.auth().verifySessionCookie(sessionCookie);
    const principal: Principal = {
      id: decodedIdToken.uid,
      email: decodedIdToken.email!,
      name: decodedIdToken.name!,
      guestOf: decodedIdToken.guestOf,
      hasPassword: true,
    };
    return { req, res, principal } as Context;
  } catch (error) {
    return { req, res, principal: null } as Context;
  }
};

const getSessionCookieFromBearer = (authorization: string | undefined) => {
  if (authorization === undefined) {
    return undefined;
  }
  return authorization.replace(/Bearer\s/, '');
};
