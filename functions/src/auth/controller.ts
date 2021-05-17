import { Router } from 'express';
import { LoginBody } from './types';

export const authController = Router();

authController.post('/login', (req, res, next) => {
  console.log('accessed login route');
  const { email, password } = req.body as LoginBody;
  console.log({ email, password });
  res.send(200);
})