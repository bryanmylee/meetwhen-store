import { ExpressContext } from 'apollo-server-express';
import { ContextFunction } from 'apollo-server-core';
import { firebaseAdmin } from '../firebase/setup';
import { auth } from 'firebase-admin';

export type Principal = auth.DecodedIdToken | null;
export type Context = ExpressContext & { principal: Principal };

export const context: ContextFunction<ExpressContext, object> = async ({ req, res }) => {
  const principal: Principal = req.cookies.__session
    ? await firebaseAdmin.auth().verifyIdToken(req.cookies.__session)
    : null;
  return { req, res, principal } as Context;
};
