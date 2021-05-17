import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
import Container from 'typedi';
import { TokenService } from '../token/service';

export const context: ContextFunction<ExpressContext, object> = ({ req, res }) => {
  const principal = req.cookies.__session
    ? Container.get(TokenService).verifyAccessToken(req.cookies.__session)
    : {};
  return { req, res, principal };
};
