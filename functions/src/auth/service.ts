import axios from 'axios';
import { Service } from 'typedi';
import { config } from '../config';

const SIGN_IN_WITH_PASSWORD_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.webAPIKey}`;

class LoginArgs {
  email: string;
  password: string;
}

class LoginOutput {
  // A Firebase Auth ID token for the authenticated user.
  idToken: string;
  // The email for the authenticated user.
  email: string;
  // A firebase Auth refresh token for the authenticated user.
  refreshToken: string;
  // The number of seconds in which the token expires.
  expiresIn?: string;
  // The uid of the authenticated user.
  localId: string;
  // Whether the email is for an existing account.
  registered: boolean;
}

@Service()
export class AuthService {
  async login({ email, password }: LoginArgs) {
    try {
      const response = await axios.post(SIGN_IN_WITH_PASSWORD_ENDPOINT, { email, password });
      return response.data as LoginOutput;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
}
