import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
import Container from 'typedi';
import { TokenService } from '../token/service';
import { Principal } from '../token/types';

export type Context = ExpressContext & { principal: Principal | null };

export const context: ContextFunction<ExpressContext, object> = ({ req, res }) => {
  const principal = req.cookies.__session
    ? Container.get(TokenService).verifyAccessToken(req.cookies.__session)
    : null;
  return { req, res, principal } as Context;
};
