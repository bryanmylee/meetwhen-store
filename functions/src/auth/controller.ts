import { Router } from 'express';
import { Container } from 'typedi';
import { AuthService } from './service';
import { LoginBody } from './types';

export const authController = Router();

const authService = Container.get(AuthService);

authController.post('/login', async (req, res) => {
  const { email, password } = req.body as LoginBody;
  try {
    const { idToken } = await authService.login({ email, password });
    res.setHeader('cache-control', 'private');
    res.cookie('__session', idToken, {
      httpOnly: true,
    });
    res.send();
  } catch (error) {
    res.send(error);
  }
});
