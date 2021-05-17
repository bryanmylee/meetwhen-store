import * as functions from 'firebase-functions';

export const env: Record<string, string> = {
  projectId: functions.config().api.project_id,
};
