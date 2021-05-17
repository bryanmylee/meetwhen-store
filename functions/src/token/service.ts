import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { Service } from 'typedi';
import { config } from '../config';
import { Principal } from './types';

@Service()
export class TokenService {
  createAccessToken(userId: string) {
    const payload: Principal = { uid: userId };
    return jwt.sign(payload, config.accessSecret, {
      expiresIn: '1 day',
    });
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, config.accessSecret) as Principal;
    } catch (error) {
      const jwtError = error as JsonWebTokenError;
      console.log(jwtError.message);
      return {};
    }
  }
}
