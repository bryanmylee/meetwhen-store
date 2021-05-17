import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
import { auth } from 'firebase-admin';
import { firebaseAdmin } from '../firebase/setup';

export type Principal = auth.DecodedIdToken | null;
export type Context = ExpressContext & { principal: Principal };

export const context: ContextFunction<ExpressContext, object> = async ({ req, res }) => {
  try {
    const principal: Principal = await firebaseAdmin.auth().verifyIdToken(req.cookies.__session);
    return { req, res, principal } as Context;
  } catch (error) {
    return { req, res, principal: null } as Context;
  }
};
