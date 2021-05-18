import * as functions from 'firebase-functions';

export const env = {
  env: (functions.config().api.env as string) ?? 'production',
};
