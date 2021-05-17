import * as functions from 'firebase-functions';

export const config = {
  accessSecret: functions.config().api.access_secret,
  refreshSecret: functions.config().api.refresh_secret,
};
