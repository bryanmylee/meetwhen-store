import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { JWTPayload } from './types';
import { config } from '../config';

@Service()
export class TokenService {
  createAccessToken(userId: string) {
    const payload: JWTPayload = { uid: userId };
    return jwt.sign(payload, config.accessSecret, {
      expiresIn: '1 day',
    });
  }
}