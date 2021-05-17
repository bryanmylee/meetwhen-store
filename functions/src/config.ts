import * as functions from 'firebase-functions';

export const config = {
  webAPIKey: functions.config().api.web_api_key,
};
